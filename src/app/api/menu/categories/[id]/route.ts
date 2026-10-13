import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { supabase } from '@/lib/supabase'

// PATCH /api/menu/categories/[id]
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

    // Verify category belongs to owner's restaurant
    const { data: restaurant } = await supabase
      .from('Restaurant')
      .select('id')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const { data: existingCat } = await supabase
      .from('MenuCategory')
      .select('id, restaurantId')
      .eq('id', id)
      .maybeSingle()

    if (!existingCat || existingCat.restaurantId !== restaurant.id) {
      return NextResponse.json({ error: 'Category not found or unauthorized' }, { status: 404 })
    }

    const updates: Record<string, any> = {}
    if (typeof body.name === 'string') updates.name = body.name.trim()
    if (typeof body.sortOrder === 'number') updates.sortOrder = body.sortOrder

    const { data: updated, error } = await supabase
      .from('MenuCategory')
      .update(updates)
      .eq('id', id)
      .select('*, items:MenuItem(*)')
      .single()

    if (error || !updated) {
      return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, category: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// DELETE /api/menu/categories/[id]
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

    // Verify ownership
    const { data: restaurant } = await supabase
      .from('Restaurant')
      .select('id')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const { data: existingCat } = await supabase
      .from('MenuCategory')
      .select('id, restaurantId')
      .eq('id', id)
      .maybeSingle()

    if (!existingCat || existingCat.restaurantId !== restaurant.id) {
      return NextResponse.json({ error: 'Category not found or unauthorized' }, { status: 404 })
    }

    // Cascade delete items in this category
    await supabase.from('MenuItem').delete().eq('categoryId', id)

    // Delete category
    const { error: delError } = await supabase.from('MenuCategory').delete().eq('id', id)

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
