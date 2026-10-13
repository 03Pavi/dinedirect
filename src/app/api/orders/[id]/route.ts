import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { supabase } from '@/lib/supabase'
import { OrderStatus } from '@/types/order-types'

const VALID_STATUSES: OrderStatus[] = [
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'REJECTED',
  'CANCELLED',
]

// GET /api/orders/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: order, error } = await supabase
      .from('Order')
      .select('*, items:OrderItem(*), restaurant:Restaurant(id, name, address, phone, ownerId), customer:User(id, name, email, phone)')
      .eq('id', id)
      .maybeSingle()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check authorization: must be either the customer or the restaurant owner
    const isOwner = user.role === 'RESTAURANT_OWNER' && order.restaurant?.ownerId === user.id
    const isCustomer = order.customerId === user.id

    if (!isOwner && !isCustomer) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, note } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch existing order with restaurant owner info
    const { data: existingOrder, error: fetchError } = await supabase
      .from('Order')
      .select('*, restaurant:Restaurant(id, ownerId)')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const isOwner = user.role === 'RESTAURANT_OWNER' && existingOrder.restaurant?.ownerId === user.id
    const isCustomer = existingOrder.customerId === user.id

    if (!isOwner) {
      // Customers can only cancel their own orders if status is PLACED
      if (isCustomer && status === 'CANCELLED' && existingOrder.status === 'PLACED') {
        // Allowed
      } else {
        return NextResponse.json(
          { error: 'You do not have permission to update this order status' },
          { status: 403 }
        )
      }
    }

    const updatePayload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    }
    if (typeof note === 'string') {
      updatePayload.note = note
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('Order')
      .update(updatePayload)
      .eq('id', id)
      .select('*, items:OrderItem(*), restaurant:Restaurant(id, name, address, phone), customer:User(id, name, email, phone)')
      .single()

    if (updateError || !updatedOrder) {
      return NextResponse.json(
        { error: updateError?.message || 'Failed to update order status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
