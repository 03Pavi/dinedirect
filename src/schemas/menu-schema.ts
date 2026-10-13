import { z } from 'zod'

export const categorySchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  sortOrder: z.number().int().optional().default(0),
})

export const menuItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().min(3, 'Description is required'),
  price: z.number().positive('Price must be greater than 0'),
  imageUrl: z.string().url('Must be a valid image URL').optional().nullable().or(z.literal('')),
  isVeg: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  prepTimeMins: z.number().int().positive().default(20),
})

export const updateMenuItemSchema = menuItemSchema.partial().extend({
  id: z.string().min(1, 'Item ID is required').optional(),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type MenuItemInput = z.infer<typeof menuItemSchema>
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>
