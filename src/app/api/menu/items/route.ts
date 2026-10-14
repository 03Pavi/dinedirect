import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { menuItemSchema } from '@/schemas/menu-schema'
import { supabase } from '@/lib/supabase'

// GET /api/menu/items?restaurantId=<uuid>&categoryId=<uuid>&isVeg=true&isAvailable=true&search=paneer
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    let restaurantId = searchParams.get('restaurantId')
    const categoryId = searchParams.get('categoryId')
    const isVegParam = searchParams.get('isVeg')
    const isAvailableParam = searchParams.get('isAvailable')
    const search = searchParams.get('search')

    // If no restaurantId provided, check if logged in as owner
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

    // If restaurantId is known, find valid categoryIds for this restaurant
    let allowedCategoryIds: string[] | null = null
    if (restaurantId) {
      const { data: categories } = await supabase
        .from('MenuCategory')
        .select('id')
        .eq('restaurantId', restaurantId)

      if (categories) {
        allowedCategoryIds = categories.map((c) => c.id)
      }
    }

    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1
    const limit = limitParam
      ? Math.max(1, parseInt(limitParam, 10))
      : pageParam
      ? 10
      : undefined

    let query = supabase
      .from('MenuItem')
      .select(
        '*, category:MenuCategory(id, name, restaurantId, restaurant:Restaurant(id, name, city, deliveryFee, minOrder, imageUrl, isOpen))',
        { count: 'exact' }
      )

    if (categoryId) {
      query = query.eq('categoryId', categoryId)
    } else if (allowedCategoryIds) {
      if (allowedCategoryIds.length === 0) {
        return NextResponse.json({
          items: [],
          pagination: {
            page: 1,
            limit: limit || 10,
            total: 0,
            totalPages: 1,
            hasMore: false,
          },
        })
      }
      query = query.in('categoryId', allowedCategoryIds)
    }

    if (isVegParam !== null && isVegParam !== undefined) {
      query = query.eq('isVeg', isVegParam === 'true')
    }

    if (isAvailableParam !== null && isAvailableParam !== undefined) {
      query = query.eq('isAvailable', isAvailableParam === 'true')
    }

    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`)
    }

    // Apply pagination range if limit is set
    if (limit !== undefined && !isNaN(limit) && limit > 0) {
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)
    }

    const { data: items, error, count } = await query.order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const total = count ?? items?.length ?? 0
    const effectiveLimit = limit || total || 10
    const totalPages = Math.max(1, Math.ceil(total / effectiveLimit))
    const hasMore = limit !== undefined ? page < totalPages : false

    return NextResponse.json({
      items: items || [],
      pagination: {
        page,
        limit: effectiveLimit,
        total,
        totalPages,
        hasMore,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/menu/items
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json(
        { error: 'Only restaurant owners can add menu items' },
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
    const parsed = menuItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid menu item data' },
        { status: 400 }
      )
    }

    const itemData = parsed.data

    // Verify category belongs to this owner's restaurant
    const { data: category, error: catError } = await supabase
      .from('MenuCategory')
      .select('id, restaurantId')
      .eq('id', itemData.categoryId)
      .maybeSingle()

    if (catError || !category || category.restaurantId !== restaurant.id) {
      return NextResponse.json(
        { error: 'Selected category does not belong to your restaurant' },
        { status: 400 }
      )
    }

    const newId = crypto.randomUUID()
    const { data: newItem, error: insertError } = await supabase
      .from('MenuItem')
      .insert({
        id: newId,
        categoryId: itemData.categoryId,
        name: itemData.name.trim(),
        description: itemData.description.trim(),
        price: Number(itemData.price),
        imageUrl: itemData.imageUrl || null,
        isVeg: itemData.isVeg ?? true,
        isAvailable: itemData.isAvailable ?? true,
        prepTimeMins: itemData.prepTimeMins ?? 20,
      })
      .select()
      .single()

    if (insertError || !newItem) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create menu item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      item: newItem,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
