import { createAsyncThunk } from '@reduxjs/toolkit'
import { Order, OrderStatus } from '@/types/order-types'

export const fetchOrdersThunk = createAsyncThunk<
  Order[],
  { restaurantId?: string } | undefined,
  { rejectValue: string }
>('order/fetchOrders', async (params, { rejectWithValue }) => {
  try {
    const url = params?.restaurantId
      ? `/api/orders?restaurantId=${encodeURIComponent(params.restaurantId)}`
      : '/api/orders'

    const res = await fetch(url)
    const data = await res.json()

    if (!res.ok) {
      return rejectWithValue(data.error || 'Failed to fetch orders')
    }

    return data.orders as Order[]
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Network error fetching orders')
  }
})

export const updateOrderStatusThunk = createAsyncThunk<
  Order,
  { orderId: string; status: OrderStatus; note?: string },
  { rejectValue: string }
>('order/updateOrderStatus', async ({ orderId, status, note }, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    })
    const data = await res.json()

    if (!res.ok) {
      return rejectWithValue(data.error || 'Failed to update order status')
    }

    return data.order as Order
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Network error updating order status')
  }
})

export const createDemoOrderThunk = createAsyncThunk<
  Order,
  void,
  { rejectValue: string }
>('order/createDemoOrder', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/orders/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json()

    if (!res.ok) {
      return rejectWithValue(data.error || 'Failed to create demo order')
    }

    return data.order as Order
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Network error creating demo order')
  }
})
