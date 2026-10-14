import fs from 'fs'
import path from 'path'
import { supabase } from '@/lib/supabase'
import { QRCodeItem, QRType } from '@/types/qr-types'

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'qr-codes.json')

function readLocalQRCodes(): Record<string, QRCodeItem[]> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    }
  } catch (err) {
    console.error('Error reading local qr-codes.json:', err)
  }
  return {}
}

function saveLocalQRCodes(data: Record<string, QRCodeItem[]>): void {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving local qr-codes.json:', err)
  }
}

/**
 * Fetch all QR codes for a restaurant from Supabase DB, falling back to local database store.
 */
export async function getRestaurantQRCodes(
  restaurantId: string,
  host?: string
): Promise<QRCodeItem[]> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://dinedirect-kappa.vercel.app').replace(/\/+$/, '')
  const effectiveHost = host || appUrl
  try {
    // 1. Try Supabase first
    const { data, error } = await supabase
      .from('QRCode')
      .select('*')
      .eq('restaurantId', restaurantId)
      .order('createdAt', { ascending: false })

    if (!error && data) {
      return data.map((d: any) => ({
        id: d.id,
        restaurantId: d.restaurantId,
        tableNumber: d.tableNumber,
        label: d.label,
        code: d.code,
        url: d.url || `${effectiveHost}/home?restaurantId=${encodeURIComponent(restaurantId)}&table=${encodeURIComponent(d.tableNumber)}&qrId=${encodeURIComponent(d.id)}`,
        color: d.color || '#ea580c',
        scansCount: d.scansCount || 0,
        qrType: (d.qrType as QRType) || 'TABLE',
        createdAt: d.createdAt,
        lastScannedAt: d.lastScannedAt || null,
      }))
    }
  } catch (e) {
    console.warn('Supabase QRCode table not available, using persistent DB store:', e)
  }

  // 2. Fallback to local DB store
  const all = readLocalQRCodes()
  const list = all[restaurantId] || []
  return list
}

/**
 * Create a new QR code in DB.
 */
export async function createRestaurantQRCode(params: {
  restaurantId: string
  tableNumber: string
  label?: string
  color?: string
  qrType?: QRType
  host?: string
}): Promise<QRCodeItem> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://dinedirect-kappa.vercel.app').replace(/\/+$/, '')
  const host = params.host || appUrl
  const id = `qr-${params.restaurantId}-${Date.now().toString(36)}`
  const sanitizedTable = params.tableNumber.trim()
  const sanitizedCode = `DINE-${params.restaurantId.slice(0, 4).toUpperCase()}-${sanitizedTable.replace(/\s+/g, '').toUpperCase()}`
  const qrType: QRType = params.qrType || 'TABLE'
  const label = params.label?.trim() || `${sanitizedTable} Dining QR`
  const color = params.color || '#ea580c'
  const url = `${host}/home?restaurantId=${encodeURIComponent(params.restaurantId)}&table=${encodeURIComponent(sanitizedTable)}&qrId=${encodeURIComponent(id)}`
  const now = new Date().toISOString()

  const newQR: QRCodeItem = {
    id,
    restaurantId: params.restaurantId,
    tableNumber: sanitizedTable,
    label,
    code: sanitizedCode,
    url,
    color,
    scansCount: 0,
    qrType,
    createdAt: now,
    lastScannedAt: null,
  }

  // 1. Try saving to Supabase
  try {
    const { data, error } = await supabase.from('QRCode').insert({
      id: newQR.id,
      restaurantId: newQR.restaurantId,
      tableNumber: newQR.tableNumber,
      label: newQR.label,
      code: newQR.code,
      url: newQR.url,
      color: newQR.color,
      scansCount: 0,
      qrType: newQR.qrType,
      createdAt: newQR.createdAt,
      lastScannedAt: null,
    }).select().maybeSingle()

    if (!error && data) {
      // Also cache in local DB store for resilience
      const all = readLocalQRCodes()
      const list = all[params.restaurantId] || []
      list.unshift(newQR)
      all[params.restaurantId] = list
      saveLocalQRCodes(all)
      return newQR
    }
  } catch (e) {
    console.warn('Could not insert into Supabase QRCode table, falling back to local DB:', e)
  }

  // 2. Save in local DB store
  const all = readLocalQRCodes()
  const list = all[params.restaurantId] || []
  list.unshift(newQR)
  all[params.restaurantId] = list
  saveLocalQRCodes(all)

  return newQR
}

/**
 * Record real QR scan event in DB and update scansCount.
 */
export async function recordQRScan(qrId: string): Promise<{ success: boolean; scansCount: number }> {
  const now = new Date().toISOString()

  // 1. Try updating in Supabase
  try {
    const { data: existing } = await supabase
      .from('QRCode')
      .select('scansCount')
      .eq('id', qrId)
      .maybeSingle()

    if (existing) {
      const newCount = (existing.scansCount || 0) + 1
      await supabase
        .from('QRCode')
        .update({ scansCount: newCount, lastScannedAt: now })
        .eq('id', qrId)

      // Also update local store
      const all = readLocalQRCodes()
      for (const rId of Object.keys(all)) {
        const item = all[rId].find((q) => q.id === qrId)
        if (item) {
          item.scansCount = newCount
          item.lastScannedAt = now
          saveLocalQRCodes(all)
          break
        }
      }
      return { success: true, scansCount: newCount }
    }
  } catch (e) {
    console.warn('Error recording scan in Supabase:', e)
  }

  // 2. Update in local DB store
  const all = readLocalQRCodes()
  for (const rId of Object.keys(all)) {
    const list = all[rId]
    const idx = list.findIndex((q) => q.id === qrId)
    if (idx !== -1) {
      list[idx].scansCount = (list[idx].scansCount || 0) + 1
      list[idx].lastScannedAt = now
      all[rId] = list
      saveLocalQRCodes(all)
      return { success: true, scansCount: list[idx].scansCount }
    }
  }

  return { success: false, scansCount: 0 }
}

/**
 * Delete QR code from DB.
 */
export async function deleteRestaurantQRCode(restaurantId: string, qrId: string): Promise<boolean> {
  // 1. Try Supabase
  try {
    await supabase.from('QRCode').delete().eq('id', qrId).eq('restaurantId', restaurantId)
  } catch (e) {
    console.warn('Error deleting from Supabase:', e)
  }

  // 2. Update local DB
  const all = readLocalQRCodes()
  if (!all[restaurantId]) return false

  const initialLength = all[restaurantId].length
  all[restaurantId] = all[restaurantId].filter((q) => q.id !== qrId)

  if (all[restaurantId].length !== initialLength) {
    saveLocalQRCodes(all)
    return true
  }

  return false
}

/**
 * Get active table numbers for a restaurant (for customer Dine-in ordering / table selection).
 */
export async function getRestaurantTables(restaurantId: string): Promise<{ id: string; tableNumber: string; label: string }[]> {
  const qrs = await getRestaurantQRCodes(restaurantId)
  return qrs
    .filter((q) => q.qrType !== 'RESTAURANT' && q.tableNumber.toLowerCase() !== 'menu')
    .map((q) => ({
      id: q.id,
      tableNumber: q.tableNumber,
      label: q.label || q.tableNumber,
    }))
}
