import fs from 'fs'
import path from 'path'

export interface RestaurantQRCode {
  id: string
  restaurantId: string
  tableNumber: string
  label: string
  code: string
  url: string
  color: string
  scansCount: number
  createdAt: string
  lastScannedAt: string | null
}

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'qr-codes.json')

function readAllQRCodes(): Record<string, RestaurantQRCode[]> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8')
      return JSON.parse(content)
    }
  } catch (err) {
    console.error('Error reading qr-codes.json:', err)
  }
  return {}
}

function saveAllQRCodes(data: Record<string, RestaurantQRCode[]>): void {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving qr-codes.json:', err)
  }
}

export function getRestaurantQRCodes(restaurantId: string, restaurantName: string = 'Restaurant', host: string = 'http://localhost:3000'): RestaurantQRCode[] {
  const all = readAllQRCodes()

  // If no QR codes exist yet for this restaurant, create default starter tables
  if (!all[restaurantId] || all[restaurantId].length === 0) {
    const defaultTables = [
      { tableNumber: 'Table 1', label: 'Main Hall - Table 1', scans: 42, color: '#ea580c' },
      { tableNumber: 'Table 2', label: 'Main Hall - Table 2', scans: 29, color: '#ea580c' },
      { tableNumber: 'Table 3', label: 'Window Booth - Table 3', scans: 64, color: '#0f172a' },
      { tableNumber: 'Table 4', label: 'Outdoor Terrace - Table 4', scans: 37, color: '#059669' },
      { tableNumber: 'Counter', label: 'Express Pickup / Takeaway', scans: 88, color: '#4338ca' },
    ]

    const initialQRs: RestaurantQRCode[] = defaultTables.map((t, idx) => {
      const id = `qr-${restaurantId}-${idx + 1}`
      const code = `DINE-${restaurantId.slice(0, 4).toUpperCase()}-T${idx + 1}`
      const url = `${host}/menu?restaurantId=${encodeURIComponent(restaurantId)}&table=${encodeURIComponent(t.tableNumber)}&qrId=${encodeURIComponent(id)}`
      return {
        id,
        restaurantId,
        tableNumber: t.tableNumber,
        label: t.label,
        code,
        url,
        color: t.color,
        scansCount: t.scans,
        createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 2).toISOString(),
        lastScannedAt: new Date(Date.now() - (idx + 1) * 3600000 * 3).toISOString(),
      }
    })

    all[restaurantId] = initialQRs
    saveAllQRCodes(all)
    return initialQRs
  }

  return all[restaurantId]
}

export function createRestaurantQRCode(params: {
  restaurantId: string
  tableNumber: string
  label?: string
  color?: string
  host?: string
}): RestaurantQRCode {
  const all = readAllQRCodes()
  const list = all[params.restaurantId] || []

  const id = `qr-${params.restaurantId}-${Date.now().toString(36)}`
  const code = `DINE-${params.restaurantId.slice(0, 4).toUpperCase()}-${params.tableNumber.replace(/\s+/g, '').toUpperCase()}`
  const host = params.host || 'http://localhost:3000'
  const url = `${host}/menu?restaurantId=${encodeURIComponent(params.restaurantId)}&table=${encodeURIComponent(params.tableNumber)}&qrId=${encodeURIComponent(id)}`

  const newQR: RestaurantQRCode = {
    id,
    restaurantId: params.restaurantId,
    tableNumber: params.tableNumber,
    label: params.label || `${params.tableNumber} Dining QR`,
    code,
    url,
    color: params.color || '#ea580c',
    scansCount: 0,
    createdAt: new Date().toISOString(),
    lastScannedAt: null,
  }

  list.unshift(newQR)
  all[params.restaurantId] = list
  saveAllQRCodes(all)

  return newQR
}

export function recordQRScan(qrId: string, restaurantId?: string): { success: boolean; scansCount: number } {
  const all = readAllQRCodes()

  for (const rId of Object.keys(all)) {
    const list = all[rId]
    const idx = list.findIndex((q) => q.id === qrId)
    if (idx !== -1) {
      list[idx].scansCount += 1
      list[idx].lastScannedAt = new Date().toISOString()
      all[rId] = list
      saveAllQRCodes(all)
      return { success: true, scansCount: list[idx].scansCount }
    }
  }

  return { success: false, scansCount: 0 }
}

export function deleteRestaurantQRCode(restaurantId: string, qrId: string): boolean {
  const all = readAllQRCodes()
  if (!all[restaurantId]) return false

  const initialLength = all[restaurantId].length
  all[restaurantId] = all[restaurantId].filter((q) => q.id !== qrId)

  if (all[restaurantId].length !== initialLength) {
    saveAllQRCodes(all)
    return true
  }

  return false
}
