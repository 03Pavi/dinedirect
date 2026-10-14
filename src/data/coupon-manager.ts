import { supabase } from '@/lib/supabase'

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
  updatedAt?: string
}

/**
 * Fetch exact coupons created for a given restaurant from Supabase.
 */
export async function getRestaurantCoupons(restaurantId: string): Promise<RestaurantCoupon[]> {
  try {
    const { data, error } = await supabase
      .from('Coupon')
      .select('*')
      .eq('restaurantId', restaurantId)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching coupons from Supabase:', error)
      return []
    }

    return (data as RestaurantCoupon[]) || []
  } catch (err) {
    console.error('Unexpected error in getRestaurantCoupons:', err)
    return []
  }
}

/**
 * Create a new coupon for a restaurant in Supabase.
 */
export async function createRestaurantCoupon(params: {
  restaurantId: string
  code: string
  description?: string
  discountType: 'PERCENTAGE' | 'FLAT'
  discountValue: number
  minOrderAmount?: number
  maxDiscount?: number
  expiresAt?: string | null
}): Promise<RestaurantCoupon> {
  const formattedCode = params.code.trim().toUpperCase()

  // Check duplicate coupon code for this restaurant
  const { data: existing } = await supabase
    .from('Coupon')
    .select('id')
    .eq('restaurantId', params.restaurantId)
    .eq('code', formattedCode)
    .maybeSingle()

  if (existing) {
    throw new Error(`A coupon with code "${formattedCode}" already exists for this restaurant.`)
  }

  const newCouponPayload = {
    id: `cpn-${params.restaurantId}-${Date.now().toString(36)}`,
    restaurantId: params.restaurantId,
    code: formattedCode,
    description:
      params.description?.trim() ||
      `${params.discountType === 'PERCENTAGE' ? `${params.discountValue}% OFF` : `₹${params.discountValue} OFF`} on your order`,
    discountType: params.discountType,
    discountValue: Number(params.discountValue),
    minOrderAmount: Number(params.minOrderAmount || 0),
    maxDiscount: params.maxDiscount ? Number(params.maxDiscount) : null,
    isActive: true,
    usageCount: 0,
    expiresAt: params.expiresAt || null,
  }

  const { data, error } = await supabase
    .from('Coupon')
    .insert(newCouponPayload)
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create coupon in Supabase')
  }

  return data as RestaurantCoupon
}

/**
 * Update an existing coupon in Supabase.
 */
export async function updateRestaurantCoupon(
  restaurantId: string,
  couponId: string,
  updates: Partial<Omit<RestaurantCoupon, 'id' | 'restaurantId'>>
): Promise<RestaurantCoupon | null> {
  const payload: Record<string, any> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  if (updates.code) {
    payload.code = updates.code.trim().toUpperCase()
  }

  const { data, error } = await supabase
    .from('Coupon')
    .update(payload)
    .eq('id', couponId)
    .eq('restaurantId', restaurantId)
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error updating coupon in Supabase:', error)
    throw new Error(error.message)
  }

  return (data as RestaurantCoupon) || null
}

/**
 * Delete a coupon from Supabase.
 */
export async function deleteRestaurantCoupon(restaurantId: string, couponId: string): Promise<boolean> {
  const { error } = await supabase
    .from('Coupon')
    .delete()
    .eq('id', couponId)
    .eq('restaurantId', restaurantId)

  if (error) {
    console.error('Error deleting coupon in Supabase:', error)
    return false
  }

  return true
}

/**
 * Validate a coupon code for an order.
 */
export async function validateCoupon(
  restaurantId: string,
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; message: string; coupon?: RestaurantCoupon }> {
  const formattedCode = code.trim().toUpperCase()

  const { data, error } = await supabase
    .from('Coupon')
    .select('*')
    .eq('restaurantId', restaurantId)
    .eq('code', formattedCode)
    .maybeSingle()

  if (error || !data) {
    return {
      valid: false,
      discount: 0,
      message: `Invalid coupon code "${formattedCode}".`,
    }
  }

  const coupon = data as RestaurantCoupon

  if (!coupon.isActive) {
    return {
      valid: false,
      discount: 0,
      message: `Coupon "${formattedCode}" is currently inactive.`,
    }
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return {
      valid: false,
      discount: 0,
      message: `Coupon "${formattedCode}" has expired.`,
    }
  }

  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order of ₹${coupon.minOrderAmount} required for coupon ${formattedCode}. Add ₹${coupon.minOrderAmount - subtotal} more!`,
    }
  }

  let discount = 0
  if (coupon.discountType === 'PERCENTAGE') {
    discount = Math.round((subtotal * coupon.discountValue) / 100)
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal)
  }

  return {
    valid: true,
    discount,
    message: `Coupon ${formattedCode} applied successfully! You saved ₹${discount}.`,
    coupon,
  }
}

/**
 * Increment usage count of a redeemed coupon.
 */
export async function recordCouponUsage(restaurantId: string, code: string): Promise<void> {
  try {
    const formattedCode = code.trim().toUpperCase()
    const { data } = await supabase
      .from('Coupon')
      .select('id, usageCount')
      .eq('restaurantId', restaurantId)
      .eq('code', formattedCode)
      .maybeSingle()

    if (data?.id) {
      await supabase
        .from('Coupon')
        .update({
          usageCount: (data.usageCount || 0) + 1,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', data.id)
    }
  } catch (err) {
    console.error('Error incrementing coupon usage count:', err)
  }
}
