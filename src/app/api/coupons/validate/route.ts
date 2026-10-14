import { NextRequest, NextResponse } from 'next/server'
import { validateCoupon, getRestaurantCoupons } from '@/data/coupon-manager'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { restaurantId, code, subtotal } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code' }, { status: 400 })
    }

    if (!restaurantId) {
      // Fallback global check
      const upper = code.trim().toUpperCase()
      if (upper === 'WELCOME50') {
        const discount = Math.min(50, Number(subtotal || 0))
        return NextResponse.json({ valid: true, discount, message: 'Flat ₹50 OFF applied!' })
      }
      if (upper === 'FEAST20') {
        const discount = Math.round(Number(subtotal || 0) * 0.2)
        return NextResponse.json({ valid: true, discount, message: '20% OFF applied!' })
      }
      return NextResponse.json({ valid: false, message: 'Invalid coupon code.' }, { status: 400 })
    }

    const result = await validateCoupon(restaurantId, code, Number(subtotal || 0))

    if (!result.valid) {
      return NextResponse.json({ valid: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      discount: result.discount,
      message: result.message,
      coupon: result.coupon,
    })
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json({ coupons: [] })
    }

    const allCoupons = await getRestaurantCoupons(restaurantId)
    const coupons = allCoupons.filter((c) => c.isActive)
    return NextResponse.json({ coupons })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
