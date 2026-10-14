import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { supabase } from '@/lib/supabase'
import {
  getRestaurantQRCodes,
  createRestaurantQRCode,
  deleteRestaurantQRCode,
} from '@/data/qr-manager'

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

    const origin = req.nextUrl.origin || 'http://localhost:3000'
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
    const { tableNumber, label, color, qrType } = body

    if (!tableNumber || typeof tableNumber !== 'string') {
      return NextResponse.json({ error: 'Table number or label is required' }, { status: 400 })
    }

    const origin = req.nextUrl.origin || 'http://localhost:3000'
    const qr = await createRestaurantQRCode({
      restaurantId: restaurant.id,
      tableNumber: tableNumber.trim(),
      label: label?.trim(),
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
