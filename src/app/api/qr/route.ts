import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { supabase } from '@/lib/supabase'
import {
  getRestaurantQRCodes,
  createRestaurantQRCode,
  deleteRestaurantQRCode,
} from '@/data/qr-manager'
import { getRestaurantCoupons, createRestaurantCoupon } from '@/data/coupon-manager'

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

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://dinedirect-kappa.vercel.app').replace(/\/+$/, '')
    const origin = appUrl || req.nextUrl.origin || 'https://dinedirect-kappa.vercel.app'
    const qrs = await getRestaurantQRCodes(restaurant.id, origin)

    return NextResponse.json({ success: true, restaurant, qrs })
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
    const {
      tableNumber,
      label,
      color,
      qrType,
      couponCode,
      discountType,
      discountValue,
      minOrderAmount,
    } = body

    const isScratch = qrType === 'SCRATCH_CARD'
    const code = (couponCode || tableNumber || '').trim().toUpperCase()

    if (!code) {
      return NextResponse.json(
        { error: isScratch ? 'Coupon code or name is required for Scratch Card' : 'Table number or label is required' },
        { status: 400 }
      )
    }

    if (isScratch) {
      try {
        const existingCoupons = await getRestaurantCoupons(restaurant.id)
        const exists = existingCoupons.find((c) => c.code.toUpperCase() === code)
        if (!exists) {
          await createRestaurantCoupon({
            restaurantId: restaurant.id,
            code,
            description: label?.trim() || `${discountValue || 20}% OFF Scratch & Win Coupon`,
            discountType: discountType || 'PERCENTAGE',
            discountValue: Number(discountValue || 20),
            minOrderAmount: Number(minOrderAmount || 0),
          })
        }
      } catch (cpnErr) {
        console.warn('Coupon auto-creation note:', cpnErr)
      }
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://dinedirect-kappa.vercel.app').replace(/\/+$/, '')
    const origin = appUrl || req.nextUrl.origin || 'https://dinedirect-kappa.vercel.app'
    const qr = await createRestaurantQRCode({
      restaurantId: restaurant.id,
      tableNumber: code,
      label: label?.trim() || (isScratch ? `Scratch & Win: ${code}` : `${code} Dining QR`),
      color: color || '#ea580c',
      qrType: qrType || 'TABLE',
      host: origin,
    })

    return NextResponse.json({ success: true, qr })
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
    const qrId = searchParams.get('id')

    if (!qrId) {
      return NextResponse.json({ error: 'QR Code ID is required' }, { status: 400 })
    }

    const deleted = await deleteRestaurantQRCode(restaurant.id, qrId)
    return NextResponse.json({ success: deleted })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
