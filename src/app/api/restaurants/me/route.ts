import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json(
        { error: 'Only restaurant owners can access this endpoint' },
        { status: 403 }
      )
    }

    const { data: restaurant, error } = await supabase
      .from('Restaurant')
      .select('*, categories:MenuCategory(*, items:MenuItem(*))')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!restaurant) {
      return NextResponse.json({ restaurant: null })
    }

    return NextResponse.json({
      restaurant: {
        ...restaurant,
        cuisine:
          typeof restaurant.cuisine === 'string'
            ? JSON.parse(restaurant.cuisine)
            : restaurant.cuisine,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Find owner's restaurant
    const { data: existing } = await supabase
      .from('Restaurant')
      .select('id')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const updates: Record<string, any> = {}
    if (typeof body.isOpen === 'boolean') updates.isOpen = body.isOpen
    if (body.name) updates.name = body.name
    if (body.description) updates.description = body.description
    if (body.address) updates.address = body.address
    if (body.city) updates.city = body.city
    if (body.phone) updates.phone = body.phone
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl
    if (body.cuisine) updates.cuisine = JSON.stringify(body.cuisine)
    if (body.openingTime) updates.openingTime = body.openingTime
    if (body.closingTime) updates.closingTime = body.closingTime
    if (body.deliveryFee !== undefined) updates.deliveryFee = body.deliveryFee
    if (body.minOrder !== undefined) updates.minOrder = body.minOrder

    const { data: updated, error } = await supabase
      .from('Restaurant')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single()

    if (error || !updated) {
      return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      restaurant: {
        ...updated,
        cuisine:
          typeof updated.cuisine === 'string'
            ? JSON.parse(updated.cuisine)
            : updated.cuisine,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
