import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { recordQRScan } from '@/data/qr-manager'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const qrId = searchParams.get('qrId')
    let restaurantId = searchParams.get('restaurantId')
    let couponCode = searchParams.get('coupon')

    let qrItem: any = null

    // 1. If qrId is passed, lookup QR code and record scan
    if (qrId) {
      try {
        const { data: qr } = await supabase
          .from('QRCode')
          .select('*')
          .eq('id', qrId)
          .maybeSingle()

        if (qr) {
          qrItem = qr
          if (!restaurantId) restaurantId = qr.restaurantId
          if (!couponCode && qr.tableNumber && qr.tableNumber !== 'Menu') {
            couponCode = qr.tableNumber
          }
        }
        // Record scan count asynchronously
        await recordQRScan(qrId)
      } catch (err) {
        console.warn('Error reading or recording QR in scratch route:', err)
      }
    }

    // 2. Fetch Restaurant Details
    let restaurant: any = null
    if (restaurantId) {
      const { data: rest } = await supabase
        .from('Restaurant')
        .select('id, name, description, address, city, imageUrl, cuisine')
        .eq('id', restaurantId)
        .maybeSingle()
      if (rest) {
        restaurant = rest
      }
    }

    // If no restaurant found yet, try finding any active restaurant as fallback
    if (!restaurant) {
      const { data: fallbackRest } = await supabase
        .from('Restaurant')
        .select('id, name, description, address, city, imageUrl, cuisine')
        .eq('isApproved', true)
        .limit(1)
        .maybeSingle()
      restaurant = fallbackRest || {
        id: restaurantId || 'default-restaurant',
        name: 'DineDirect Kitchen',
        address: 'Fine Dining Express',
        city: 'Metropolis',
      }
    }

    // 3. Fetch Coupon Details
    const formattedCode = (couponCode || 'LUCKY20').trim().toUpperCase()
    let couponDetails: any = null

    if (restaurant?.id) {
      const { data: cpn } = await supabase
        .from('Coupon')
        .select('*')
        .eq('restaurantId', restaurant.id)
        .ilike('code', formattedCode)
        .maybeSingle()

      if (cpn) {
        couponDetails = cpn
      }
    }

    // Fallback coupon if not yet registered in DB
    if (!couponDetails) {
      couponDetails = {
        id: `cpn-${formattedCode}`,
        restaurantId: restaurant.id,
        code: formattedCode,
        description: `Unlock exciting discount on your dining order!`,
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 149,
        isActive: true,
      }
    }

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        city: restaurant.city,
        imageUrl: restaurant.imageUrl,
      },
      coupon: {
        code: couponDetails.code,
        description: couponDetails.description,
        discountType: couponDetails.discountType,
        discountValue: couponDetails.discountValue,
        minOrderAmount: couponDetails.minOrderAmount || 0,
        maxDiscount: couponDetails.maxDiscount || null,
        expiresAt: couponDetails.expiresAt || null,
      },
      qr: qrItem
        ? {
            id: qrItem.id,
            color: qrItem.color,
            label: qrItem.label,
          }
        : null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
