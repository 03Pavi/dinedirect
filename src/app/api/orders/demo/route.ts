import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || user.role !== 'RESTAURANT_OWNER') {
      return NextResponse.json({ error: 'Unauthorized: Restaurant Owner only' }, { status: 401 })
    }

    // Get owner's restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('Restaurant')
      .select('id, name, deliveryFee')
      .eq('ownerId', user.id)
      .maybeSingle()

    if (restError || !restaurant) {
      return NextResponse.json({ error: 'Please set up a restaurant first' }, { status: 404 })
    }

    const demoSamples = [
      {
        customerName: 'Rahul Sharma',
        customerPhone: '+91 98765 43210',
        address: 'Table #4 (Dine-In)',
        note: 'Extra spicy, please serve mint chutney on the side',
        paymentMode: 'UPI',
        items: [
          { name: 'Paneer Butter Masala', price: 280, quantity: 1 },
          { name: 'Butter Naan', price: 50, quantity: 3 },
          { name: 'Fresh Lime Soda', price: 90, quantity: 2 },
        ],
      },
      {
        customerName: 'Priya Sundaram',
        customerPhone: '+91 91234 56789',
        address: 'Counter Pickup (Order #Takeaway)',
        note: 'Pack items separately, cutlery requested',
        paymentMode: 'CARD',
        items: [
          { name: 'Chicken Biryani Special', price: 340, quantity: 2 },
          { name: 'Mirchi Ka Salan', price: 80, quantity: 1 },
          { name: 'Gulab Jamun (2 pcs)', price: 70, quantity: 2 },
        ],
      },
      {
        customerName: 'Vikram Mehta',
        customerPhone: '+91 99887 76655',
        address: 'Table #12 (Terrace)',
        note: 'Less salt in dal tadka please',
        paymentMode: 'CASH',
        items: [
          { name: 'Dal Tadka', price: 210, quantity: 1 },
          { name: 'Jeera Rice', price: 160, quantity: 1 },
          { name: 'Tandoori Roti', price: 35, quantity: 4 },
        ],
      },
    ]

    const pick = demoSamples[Math.floor(Math.random() * demoSamples.length)]
    const subtotal = pick.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = 0 // Dine in / takeaway demo
    const totalAmount = subtotal + deliveryFee

    const orderId = crypto.randomUUID()
    const now = new Date().toISOString()

    const { data: newOrder, error: orderError } = await supabase
      .from('Order')
      .insert({
        id: orderId,
        customerId: user.id, // linked to owner or user
        restaurantId: restaurant.id,
        status: 'PLACED',
        totalAmount,
        deliveryFee,
        address: pick.address,
        note: pick.note,
        paymentMode: pick.paymentMode,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single()

    if (orderError || !newOrder) {
      return NextResponse.json({ error: orderError?.message || 'Failed to create demo order' }, { status: 500 })
    }

    const orderItemsToInsert = pick.items.map((it) => ({
      id: crypto.randomUUID(),
      orderId,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      createdAt: now,
      updatedAt: now,
    }))

    await supabase.from('OrderItem').insert(orderItemsToInsert)

    const { data: fullOrder } = await supabase
      .from('Order')
      .select('*, items:OrderItem(*), restaurant:Restaurant(id, name, address, phone), customer:User(id, name, email, phone)')
      .eq('id', orderId)
      .single()

    return NextResponse.json({ success: true, order: fullOrder || { ...newOrder, items: orderItemsToInsert } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
