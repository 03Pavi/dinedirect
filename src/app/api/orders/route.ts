import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const restaurantId = searchParams.get('restaurantId')

    let query = supabase
      .from('Order')
      .select('*, items:OrderItem(*), restaurant:Restaurant(id, name, address, phone), customer:User(id, name, email, phone)')
      .order('createdAt', { ascending: false })

    if (user.role === 'RESTAURANT_OWNER') {
      if (restaurantId) {
        query = query.eq('restaurantId', restaurantId)
      } else {
        const { data: rest } = await supabase
          .from('Restaurant')
          .select('id')
          .eq('ownerId', user.id)
          .maybeSingle()
        if (rest) {
          query = query.eq('restaurantId', rest.id)
        }
      }
    } else {
      query = query.eq('customerId', user.id)
    }

    const { data: orders, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to place an order' }, { status: 401 })
    }

    const body = await req.json()
    const { restaurantId, items, address, note, paymentMode = 'CASH' } = body

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty or missing restaurant' }, { status: 400 })
    }

    // Verify restaurant & fetch deliveryFee
    const { data: restaurant, error: restError } = await supabase
      .from('Restaurant')
      .select('id, name, deliveryFee, minOrder, isOpen')
      .eq('id', restaurantId)
      .maybeSingle()

    if (restError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const subtotal = items.reduce((sum: number, it: any) => sum + Number(it.price) * Number(it.quantity), 0)
    const deliveryFee = Number(restaurant.deliveryFee || 0)
    const totalAmount = subtotal + deliveryFee

    const orderId = crypto.randomUUID()
    const now = new Date().toISOString()

    const finalSubtotal = body.subtotal !== undefined ? Number(body.subtotal) : subtotal
    const discount = body.discount !== undefined ? Number(body.discount) : 0
    const calculatedTotal = Math.max(0, finalSubtotal - discount + deliveryFee)
    const orderAddress = address || (body.tableNumber ? `Table: ${body.tableNumber} (Dine-In)` : 'Dine-In Order')

    const baseOrderPayload: any = {
      id: orderId,
      customerId: user.id,
      restaurantId,
      status: 'PLACED',
      totalAmount: calculatedTotal,
      deliveryFee,
      address: orderAddress,
      note: note || null,
      paymentMode: paymentMode || 'CASH',
      createdAt: now,
      updatedAt: now,
    }

    const extendedOrderPayload = {
      ...baseOrderPayload,
      ...(body.orderType ? { orderType: body.orderType } : {}),
      ...(body.tableNumber ? { tableNumber: body.tableNumber } : {}),
      subtotal: finalSubtotal,
      discount,
      ...(body.couponCode ? { couponCode: body.couponCode } : {}),
    }

    let newOrder: any = null
    let orderError: any = null

    const resExtended = await supabase
      .from('Order')
      .insert(extendedOrderPayload)
      .select()
      .single()

    if (resExtended.error) {
      // Fallback to base schema in case extended columns don't exist yet
      const resBase = await supabase
        .from('Order')
        .insert(baseOrderPayload)
        .select()
        .single()
      newOrder = resBase.data
      orderError = resBase.error
    } else {
      newOrder = resExtended.data
    }

    if (orderError || !newOrder) {
      return NextResponse.json({ error: orderError?.message || 'Failed to place order' }, { status: 500 })
    }

    // Verify which menuItemIds actually exist in MenuItem table to prevent foreign key errors
    const candidateIds = items
      .map((it: any) => it.menuItemId)
      .filter((id: any) => id && typeof id === 'string')

    const validMenuItemIds = new Set<string>()

    if (candidateIds.length > 0) {
      try {
        const { data: existingMenuItems } = await supabase
          .from('MenuItem')
          .select('id')
          .in('id', candidateIds)

        if (existingMenuItems) {
          existingMenuItems.forEach((m) => validMenuItemIds.add(m.id))
        }
      } catch (err) {
        console.warn('Could not verify candidate menuItemIds:', err)
      }
    }

    // Prepare OrderItems matching the database schema
    const orderItemsToInsert = items.map((it: any) => {
      const isValidFk = it.menuItemId && validMenuItemIds.has(it.menuItemId)
      return {
        id: crypto.randomUUID(),
        orderId,
        menuItemId: isValidFk ? it.menuItemId : null,
        name: String(it.name || 'Dish'),
        price: Number(it.price || 0),
        quantity: Math.max(1, Number(it.quantity || 1)),
      }
    })

    const { error: itemsError } = await supabase
      .from('OrderItem')
      .insert(orderItemsToInsert)

    if (itemsError) {
      console.error('Error inserting order items, trying clean fallback:', itemsError)
      // Safe fallback: insert without any menuItemId foreign key reference
      const cleanItems = orderItemsToInsert.map((item) => ({
        ...item,
        menuItemId: null,
      }))
      const { error: fallbackError } = await supabase.from('OrderItem').insert(cleanItems)
      if (fallbackError) {
        console.error('Fallback items insertion also failed:', fallbackError)
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        ...newOrder,
        items: orderItemsToInsert,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
