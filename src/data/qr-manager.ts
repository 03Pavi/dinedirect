import { supabase } from '@/lib/supabase'
import { QRCodeItem, QRType } from '@/types/qr-types'

/**
 * Fetch all QR codes for a restaurant directly from the Supabase QRCode database table.
 */
export async function getRestaurantQRCodes(
  restaurantId: string,
  host?: string
): Promise<QRCodeItem[]> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://dinedirect-kappa.vercel.app').replace(/\/+$/, '')
  const effectiveHost = host || appUrl

  try {
    const { data, error } = await supabase
      .from('QRCode')
      .select('*')
      .eq('restaurantId', restaurantId)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Supabase QRCode fetch error:', error.message)
      return []
    }

    if (!data) return []

    return data.map((d: any) => {
      const type = (d.qrType as QRType) || 'TABLE'
      let fallbackUrl = `${effectiveHost}/home?restaurantId=${encodeURIComponent(restaurantId)}&table=${encodeURIComponent(d.tableNumber)}&qrId=${encodeURIComponent(d.id)}`
      if (type === 'SCRATCH_CARD') {
        fallbackUrl = `${effectiveHost}/scratch?restaurantId=${encodeURIComponent(restaurantId)}&coupon=${encodeURIComponent(d.tableNumber)}&qrId=${encodeURIComponent(d.id)}`
      } else if (type === 'RESTAURANT') {
        fallbackUrl = `${effectiveHost}/home?restaurantId=${encodeURIComponent(restaurantId)}&qrId=${encodeURIComponent(d.id)}`
      }

      return {
        id: d.id,
        restaurantId: d.restaurantId,
        tableNumber: d.tableNumber,
        label: d.label,
        code: d.code,
        url: d.url || fallbackUrl,
        color: d.color || '#ea580c',
        scansCount: d.scansCount || 0,
        qrType: type,
        createdAt: d.createdAt,
        lastScannedAt: d.lastScannedAt || null,
      }
    })
  } catch (err: any) {
    console.error('Failed to get QR codes from Supabase:', err)
    return []
  }
}

/**
 * Create a new QR code directly in the Supabase QRCode table.
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
  const qrType: QRType = params.qrType || 'TABLE'
  const isScratch = qrType === 'SCRATCH_CARD'
  const isRestaurant = qrType === 'RESTAURANT'

  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  const sanitizedCode = isScratch
    ? `SCRATCH-${params.restaurantId.slice(0, 4).toUpperCase()}-${sanitizedTable.replace(/\s+/g, '').toUpperCase()}-${randomSuffix}`
    : `DINE-${params.restaurantId.slice(0, 4).toUpperCase()}-${sanitizedTable.replace(/\s+/g, '').toUpperCase()}`

  const label = params.label?.trim() || (isScratch ? `Scratch & Win: ${sanitizedTable}` : isRestaurant ? 'Full Menu QR' : `${sanitizedTable} Dining QR`)
  const color = params.color || '#ea580c'

  let url = `${host}/home?restaurantId=${encodeURIComponent(params.restaurantId)}&table=${encodeURIComponent(sanitizedTable)}&qrId=${encodeURIComponent(id)}`
  if (isScratch) {
    url = `${host}/scratch?restaurantId=${encodeURIComponent(params.restaurantId)}&coupon=${encodeURIComponent(sanitizedTable)}&qrId=${encodeURIComponent(id)}`
  } else if (isRestaurant) {
    url = `${host}/home?restaurantId=${encodeURIComponent(params.restaurantId)}&qrId=${encodeURIComponent(id)}`
  }
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

  const { data, error } = await supabase
    .from('QRCode')
    .insert({
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
    })
    .select()
    .maybeSingle()

  if (error) {
    console.error('Supabase QRCode insert error:', error.message)
    throw new Error(`Failed to create QR Code in database: ${error.message}`)
  }

  return data
    ? {
        id: data.id,
        restaurantId: data.restaurantId,
        tableNumber: data.tableNumber,
        label: data.label,
        code: data.code,
        url: data.url,
        color: data.color,
        scansCount: data.scansCount || 0,
        qrType: (data.qrType as QRType) || 'TABLE',
        createdAt: data.createdAt,
        lastScannedAt: data.lastScannedAt || null,
      }
    : newQR
}

/**
 * Record real QR scan event directly in Supabase QRCode table.
 */
export async function recordQRScan(qrId: string): Promise<{ success: boolean; scansCount: number }> {
  const now = new Date().toISOString()

  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('QRCode')
      .select('scansCount')
      .eq('id', qrId)
      .maybeSingle()

    if (fetchErr || !existing) {
      console.warn('QRCode not found in Supabase for scan recording:', qrId)
      return { success: false, scansCount: 0 }
    }

    const newCount = (existing.scansCount || 0) + 1
    const { error: updateErr } = await supabase
      .from('QRCode')
      .update({ scansCount: newCount, lastScannedAt: now })
      .eq('id', qrId)

    if (updateErr) {
      console.error('Failed to update scan count in Supabase:', updateErr.message)
      return { success: false, scansCount: existing.scansCount || 0 }
    }

    return { success: true, scansCount: newCount }
  } catch (err: any) {
    console.error('Error recording QR scan in Supabase:', err)
    return { success: false, scansCount: 0 }
  }
}

/**
 * Delete QR code from Supabase QRCode table.
 */
export async function deleteRestaurantQRCode(restaurantId: string, qrId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('QRCode')
      .delete()
      .eq('id', qrId)
      .eq('restaurantId', restaurantId)

    if (error) {
      console.error('Supabase QRCode delete error:', error.message)
      return false
    }

    return true
  } catch (err: any) {
    console.error('Error deleting QR code from Supabase:', err)
    return false
  }
}

/**
 * Get active table numbers for a restaurant from Supabase DB.
 */
export async function getRestaurantTables(
  restaurantId: string
): Promise<{ id: string; tableNumber: string; label: string }[]> {
  const qrs = await getRestaurantQRCodes(restaurantId)
  return qrs
    .filter((q) => q.qrType !== 'RESTAURANT' && q.qrType !== 'SCRATCH_CARD' && q.tableNumber.toLowerCase() !== 'menu')
    .map((q) => ({
      id: q.id,
      tableNumber: q.tableNumber,
      label: q.label || q.tableNumber,
    }))
}
