export type QRType = 'TABLE' | 'RESTAURANT' | 'SCRATCH_CARD'

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
  couponDetails?: {
    discountType: 'PERCENTAGE' | 'FLAT'
    discountValue: number
    minOrderAmount: number
  }
}

export interface CreateQRCodePayload {
  tableNumber: string
  label?: string
  color?: string
  qrType?: QRType
  couponCode?: string
  discountType?: 'PERCENTAGE' | 'FLAT'
  discountValue?: number
  minOrderAmount?: number
  description?: string
}

export interface TableOption {
  id: string
  tableNumber: string
  label: string
  scansCount: number
}
