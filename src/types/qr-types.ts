export type QRType = 'TABLE' | 'RESTAURANT'

export interface QRCodeItem {
  id: string
  restaurantId: string
  tableNumber: string
  label: string
  code: string
  url: string
  color: string
  scansCount: number
  qrType: QRType
  createdAt: string
  lastScannedAt: string | null
}

export interface CreateQRCodePayload {
  tableNumber: string
  label?: string
  color?: string
  qrType?: QRType
}

export interface TableOption {
  id: string
  tableNumber: string
  label: string
  scansCount: number
}
