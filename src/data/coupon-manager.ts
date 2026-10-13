import fs from 'fs'
import path from 'path'

export interface RestaurantCoupon {
  id: string
  restaurantId: string
  code: string // e.g. "WELCOME50"
  description: string // e.g. "Get flat ₹50 OFF on orders above ₹199"
  discountType: 'PERCENTAGE' | 'FLAT'
  discountValue: number // 20 (%) or 50 (₹)
  minOrderAmount: number // Min order total
  maxDiscount?: number // Max cap for percentage discounts
  isActive: boolean
  usageCount: number
  expiresAt?: string | null
  createdAt: string
}

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'coupons.json')

function readAllCoupons(): Record<string, RestaurantCoupon[]> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8')
      return JSON.parse(content)
    }
  } catch (err) {
    console.error('Error reading coupons.json:', err)
  }
  return {}
}

function saveAllCoupons(data: Record<string, RestaurantCoupon[]>): void {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving coupons.json:', err)
  }
}

export function getRestaurantCoupons(restaurantId: string): RestaurantCoupon[] {
  const all = readAllCoupons()

  if (!all[restaurantId] || all[restaurantId].length === 0) {
    // Initial starter coupons for newly registered restaurants
    const defaultCoupons: RestaurantCoupon[] = [
      {
        id: `cpn-${restaurantId}-1`,
        restaurantId,
        code: 'WELCOME50',
        description: 'Flat ₹50 OFF for all new dining customers',
        discountType: 'FLAT',
        discountValue: 50,
        minOrderAmount: 199,
        maxDiscount: 50,
        isActive: true,
        usageCount: 18,
        expiresAt: null,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: `cpn-${restaurantId}-2`,
        restaurantId,
        code: 'FEAST20',
        description: 'Get 20% OFF on all large feast orders above ₹400',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 400,
        maxDiscount: 150,
        isActive: true,
        usageCount: 34,
        expiresAt: null,
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: `cpn-${restaurantId}-3`,
        restaurantId,
        code: 'WEEKEND100',
        description: 'Flat ₹100 OFF on weekend family dinners above ₹800',
        discountType: 'FLAT',
        discountValue: 100,
        minOrderAmount: 800,
        maxDiscount: 100,
        isActive: true,
        usageCount: 12,
        expiresAt: null,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ]

    all[restaurantId] = defaultCoupons
    saveAllCoupons(all)
    return defaultCoupons
  }

  return all[restaurantId]
}

export function createRestaurantCoupon(params: {
  restaurantId: string
  code: string
  description?: string
  discountType: 'PERCENTAGE' | 'FLAT'
  discountValue: number
  minOrderAmount?: number
  maxDiscount?: number
  expiresAt?: string | null
}): RestaurantCoupon {
  const all = readAllCoupons()
  const list = all[params.restaurantId] || []

  const formattedCode = params.code.trim().toUpperCase()

  // Prevent duplicate codes for the same restaurant
  const existingIdx = list.findIndex((c) => c.code === formattedCode)
  if (existingIdx !== -1) {
    throw new Error(`A coupon with code "${formattedCode}" already exists for this restaurant.`)
  }

  const newCoupon: RestaurantCoupon = {
    id: `cpn-${params.restaurantId}-${Date.now().toString(36)}`,
    restaurantId: params.restaurantId,
    code: formattedCode,
    description: params.description?.trim() || `${params.discountType === 'PERCENTAGE' ? `${params.discountValue}% OFF` : `₹${params.discountValue} OFF`} on your order`,
    discountType: params.discountType,
    discountValue: Number(params.discountValue),
    minOrderAmount: Number(params.minOrderAmount || 0),
    maxDiscount: params.maxDiscount ? Number(params.maxDiscount) : undefined,
    isActive: true,
    usageCount: 0,
    expiresAt: params.expiresAt || null,
    createdAt: new Date().toISOString(),
  }

  list.unshift(newCoupon)
  all[params.restaurantId] = list
  saveAllCoupons(all)

  return newCoupon
}

export function updateRestaurantCoupon(
  restaurantId: string,
  couponId: string,
  updates: Partial<Omit<RestaurantCoupon, 'id' | 'restaurantId'>>
): RestaurantCoupon | null {
  const all = readAllCoupons()
  const list = all[restaurantId] || []
  const idx = list.findIndex((c) => c.id === couponId)

  if (idx === -1) return null

  list[idx] = {
    ...list[idx],
    ...updates,
    ...(updates.code ? { code: updates.code.trim().toUpperCase() } : {}),
  }

  all[restaurantId] = list
  saveAllCoupons(all)
  return list[idx]
}

export function deleteRestaurantCoupon(restaurantId: string, couponId: string): boolean {
  const all = readAllCoupons()
  if (!all[restaurantId]) return false

  const initialLength = all[restaurantId].length
  all[restaurantId] = all[restaurantId].filter((c) => c.id !== couponId)

  if (all[restaurantId].length !== initialLength) {
    saveAllCoupons(all)
    return true
  }

  return false
}

export function validateCoupon(
  restaurantId: string,
  code: string,
  subtotal: number
): { valid: boolean; discount: number; message: string; coupon?: RestaurantCoupon } {
  const formattedCode = code.trim().toUpperCase()
  const coupons = getRestaurantCoupons(restaurantId)

  const found = coupons.find((c) => c.code === formattedCode && c.isActive)

  if (!found) {
    return {
      valid: false,
      discount: 0,
      message: `Invalid or inactive coupon code "${formattedCode}".`,
    }
  }

  if (subtotal < found.minOrderAmount) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order of ₹${found.minOrderAmount} required for coupon ${formattedCode}. Add ₹${found.minOrderAmount - subtotal} more!`,
    }
  }

  let discount = 0
  if (found.discountType === 'PERCENTAGE') {
    discount = Math.round((subtotal * found.discountValue) / 100)
    if (found.maxDiscount && discount > found.maxDiscount) {
      discount = found.maxDiscount
    }
  } else {
    discount = Math.min(found.discountValue, subtotal)
  }

  return {
    valid: true,
    discount,
    message: `Coupon ${formattedCode} applied successfully! You saved ₹${discount}.`,
    coupon: found,
  }
}
