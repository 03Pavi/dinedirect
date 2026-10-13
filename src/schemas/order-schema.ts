import { z } from 'zod'

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  name: z.string().min(1, 'Item name is required'),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
})

export const placeOrderSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant is required'),
  address: z.string().min(5, 'Delivery address is required (at least 5 characters)'),
  note: z.string().optional().or(z.literal('')),
  paymentMode: z.enum(['CASH', 'UPI', 'CARD']),
  items: z.array(orderItemSchema).min(1, 'Cart cannot be empty'),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PLACED',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'REJECTED',
    'CANCELLED',
  ]),
})

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
