import { z } from 'zod'

export const restaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  imageUrl: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
  cuisine: z.array(z.string()).min(1, 'Please select at least one cuisine'),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Format HH:MM (e.g. 09:00)'),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Format HH:MM (e.g. 22:00)'),
  fssaiNumber: z.string().optional().or(z.literal('')),
  deliveryFee: z.number().min(0, 'Delivery fee cannot be negative'),
  minOrder: z.number().min(0, 'Minimum order cannot be negative'),
})

export type RestaurantInput = z.infer<typeof restaurantSchema>
