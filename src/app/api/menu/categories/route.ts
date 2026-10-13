import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { categorySchema } from '@/schemas/menu-schema'
import { supabase } from '@/lib/supabase'

// GET /api/menu/categories?restaurantId=<uuid>
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    let restaurantId = searchParams.get('restaurantId')

    // If no restaurantId provided, check if current user is an owner
    if (!restaurantId) {
      const user = await requireAuth(req)
      if (user && user.role === 'RESTAURANT_OWNER') {
        const { data: rest } = await supabase
          .from('Restaurant')
          .select('id')
          .eq('ownerId', user.id)
          .maybeSingle()
        if (rest) {
          restaurantId = rest.id
        }
      }
    }

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required to fetch categories' },
        { status: 400 }
      )
    }

    const { data: categories, error } = await supabase
      .from('MenuCategory')
      .select('*, items:MenuItem(*)')
      .eq('restaurantId', restaurantId)
      .order('sortOrder', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ categories: categories || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/menu/categories
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json(
        { error: 'Only restaurant owners can create categories' },
        { status: 403 }
      )
    }

    // Owner's restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('Restaurant')
      .select('id')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (restError || !restaurant) {
      return NextResponse.json(
        { error: 'No restaurant found for this owner. Please create a restaurant first.' },
        { status: 404 }
      )
    }

    const body = await req.json()
    // Auto-assign owner's restaurantId if not present or different
    const inputData = {
      ...body,
      restaurantId: restaurant.id,
    }

    const parsed = categorySchema.safeParse(inputData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid category data' },
        { status: 400 }
      )
    }

    const { name, sortOrder } = parsed.data
    const newId = crypto.randomUUID()

    const { data: newCategory, error: insertError } = await supabase
      .from('MenuCategory')
      .insert({
        id: newId,
        restaurantId: restaurant.id,
        name: name.trim(),
        sortOrder: sortOrder ?? 0,
      })
      .select('*, items:MenuItem(*)')
      .single()

    if (insertError || !newCategory) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      category: {
        ...newCategory,
        items: newCategory.items || [],
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
