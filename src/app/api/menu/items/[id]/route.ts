import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { supabase } from '@/lib/supabase'

// PATCH /api/menu/items/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req)
    if (!user || user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Owner's restaurant
    const { data: restaurant } = await supabase
      .from('Restaurant')
      .select('id')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Verify item belongs to a category in owner's restaurant
    const { data: existingItem } = await supabase
      .from('MenuItem')
      .select('*, category:MenuCategory(restaurantId)')
      .eq('id', id)
      .maybeSingle()

    if (
      !existingItem ||
      !existingItem.category ||
      existingItem.category.restaurantId !== restaurant.id
    ) {
      return NextResponse.json({ error: 'Menu item not found or unauthorized' }, { status: 404 })
    }

    const updates: Record<string, any> = {}
    if (typeof body.name === 'string') updates.name = body.name.trim()
    if (typeof body.description === 'string') updates.description = body.description.trim()
    if (body.price !== undefined) updates.price = Number(body.price)
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl || null
    if (typeof body.isVeg === 'boolean') updates.isVeg = body.isVeg
    if (typeof body.isAvailable === 'boolean') updates.isAvailable = body.isAvailable
    if (body.prepTimeMins !== undefined) updates.prepTimeMins = Number(body.prepTimeMins)
    if (body.categoryId) {
      // If moving to another category, ensure that new category also belongs to owner
      const { data: targetCat } = await supabase
        .from('MenuCategory')
        .select('id, restaurantId')
        .eq('id', body.categoryId)
        .maybeSingle()

      if (!targetCat || targetCat.restaurantId !== restaurant.id) {
        return NextResponse.json({ error: 'Target category is invalid' }, { status: 400 })
      }
      updates.categoryId = body.categoryId
    }

    const { data: updatedItem, error } = await supabase
      .from('MenuItem')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !updatedItem) {
      return NextResponse.json({ error: error?.message || 'Failed to update item' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// DELETE /api/menu/items/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req)
    if (!user || user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: restaurant } = await supabase
      .from('Restaurant')
      .select('id')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const { data: existingItem } = await supabase
      .from('MenuItem')
      .select('*, category:MenuCategory(restaurantId)')
      .eq('id', id)
      .maybeSingle()

    if (
      !existingItem ||
      !existingItem.category ||
      existingItem.category.restaurantId !== restaurant.id
    ) {
      return NextResponse.json({ error: 'Menu item not found or unauthorized' }, { status: 404 })
    }

    const { error: delError } = await supabase.from('MenuItem').delete().eq('id', id)

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
