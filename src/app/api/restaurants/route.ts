import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { restaurantSchema } from '@/schemas/restaurant-schema'
import { supabase } from '@/lib/supabase'

// GET /api/restaurants - List all approved restaurants
export async function GET() {
  try {
    const { data: restaurants, error } = await supabase
      .from('Restaurant')
      .select('*, categories:MenuCategory(*, items:MenuItem(*))')
      .eq('isApproved', true)
      .order('createdAt', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ restaurants: restaurants || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/restaurants - Create restaurant for logged in owner
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json(
        { error: 'Only restaurant owners can create a restaurant' },
        { status: 403 }
      )
    }

    // Check if owner already has a restaurant
    const { data: existing } = await supabase
      .from('Restaurant')
      .select('id')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a restaurant registered' },
        { status: 409 }
      )
    }

    const body = await req.json()
    const parsed = restaurantSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid restaurant data' },
        { status: 400 }
      )
    }

    const data = parsed.data

    const { data: newRestaurant, error: insertError } = await supabase
      .from('Restaurant')
      .insert({
        id: crypto.randomUUID(),
        ownerId: user.id,
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        phone: data.phone,
        imageUrl: data.imageUrl || null,
        cuisine: JSON.stringify(data.cuisine),
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        fssaiNumber: data.fssaiNumber || null,
        deliveryFee: data.deliveryFee,
        minOrder: data.minOrder,
        isOpen: true,
        isApproved: true,
      })
      .select()
      .single()

    if (insertError || !newRestaurant) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create restaurant' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      restaurant: {
        ...newRestaurant,
        cuisine: typeof newRestaurant.cuisine === 'string' ? JSON.parse(newRestaurant.cuisine) : newRestaurant.cuisine,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
