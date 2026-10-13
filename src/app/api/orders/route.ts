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

    // Create Order
    const { data: newOrder, error: orderError } = await supabase
      .from('Order')
      .insert({
        id: orderId,
        customerId: user.id,
        restaurantId,
        status: 'PLACED',
        totalAmount,
        deliveryFee,
        address: address || 'Table Order / Dine In',
        note: note || null,
        paymentMode: paymentMode || 'CASH',
      })
      .select()
      .single()

    if (orderError || !newOrder) {
      return NextResponse.json({ error: orderError?.message || 'Failed to place order' }, { status: 500 })
    }

    // Create OrderItems
    const orderItemsToInsert = items.map((it: any) => ({
      id: crypto.randomUUID(),
      orderId,
      menuItemId: it.menuItemId || null,
      name: it.name,
      price: Number(it.price),
      quantity: Number(it.quantity),
    }))

    const { error: itemsError } = await supabase
      .from('OrderItem')
      .insert(orderItemsToInsert)

    if (itemsError) {
      console.error('Error inserting order items:', itemsError)
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
