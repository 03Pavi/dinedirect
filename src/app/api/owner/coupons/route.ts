import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { supabase } from '@/lib/supabase'
import {
  getRestaurantCoupons,
  createRestaurantCoupon,
  updateRestaurantCoupon,
  deleteRestaurantCoupon,
} from '@/data/coupon-manager'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json({ error: 'Unauthorized: Restaurant owner only' }, { status: 401 })
    }

    const { data: restaurant, error } = await supabase
      .from('Restaurant')
      .select('id, name')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (error || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const coupons = await getRestaurantCoupons(restaurant.id)
    return NextResponse.json({ success: true, restaurant, coupons })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json({ error: 'Unauthorized: Restaurant owner only' }, { status: 401 })
    }

    const { data: restaurant, error } = await supabase
      .from('Restaurant')
      .select('id, name')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (error || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const body = await req.json()
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, expiresAt } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    if (!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0) {
      return NextResponse.json({ error: 'Valid discount value is required' }, { status: 400 })
    }

    const newCoupon = await createRestaurantCoupon({
      restaurantId: restaurant.id,
      code: code.trim().toUpperCase(),
      description,
      discountType: discountType === 'FLAT' ? 'FLAT' : 'PERCENTAGE',
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiresAt: expiresAt || null,
    })

    return NextResponse.json({ success: true, coupon: newCoupon })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json({ error: 'Unauthorized: Restaurant owner only' }, { status: 401 })
    }

    const { data: restaurant, error } = await supabase
      .from('Restaurant')
      .select('id')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (error || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })
    }

    const updated = await updateRestaurantCoupon(restaurant.id, id, updates)
    if (!updated) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, coupon: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json({ error: 'Unauthorized: Restaurant owner only' }, { status: 401 })
    }

    const { data: restaurant, error } = await supabase
      .from('Restaurant')
      .select('id')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (error || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })
    }

    const deleted = await deleteRestaurantCoupon(restaurant.id, id)
    return NextResponse.json({ success: deleted })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
