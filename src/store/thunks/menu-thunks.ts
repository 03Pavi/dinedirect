import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@/utils/api-client'
import {
  MenuCategory,
  MenuItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateItemPayload,
  UpdateItemPayload,
} from '@/types/menu-types'

// Fetch entire menu (categories with items)
export const fetchMenuThunk = createAsyncThunk<
  { categories: MenuCategory[]; items: MenuItem[] },
  { restaurantId?: string } | void,
  { rejectValue: string }
>('menu/fetchMenu', async (params, { rejectWithValue }) => {
  try {
    const query = params?.restaurantId ? `?restaurantId=${params.restaurantId}` : ''
    const catRes = await apiClient.get<{ categories: MenuCategory[] }>(
      `/api/menu/categories${query}`
    )
    const itemRes = await apiClient.get<{ items: MenuItem[] }>(`/api/menu/items${query}`)

    return {
      categories: catRes.categories || [],
      items: itemRes.items || [],
    }
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch menu')
  }
})

// Create Category
export const createCategoryThunk = createAsyncThunk<
  MenuCategory,
  { name: string; sortOrder?: number; restaurantId?: string },
  { rejectValue: string }
>('menu/createCategory', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<{ success: boolean; category: MenuCategory }>(
      '/api/menu/categories',
      payload
    )
    return res.category
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to create category')
  }
})

// Update Category
export const updateCategoryThunk = createAsyncThunk<
  MenuCategory,
  UpdateCategoryPayload,
  { rejectValue: string }
>('menu/updateCategory', async (payload, { rejectWithValue }) => {
  try {
    const { id, ...data } = payload
    const res = await apiClient.patch<{ success: boolean; category: MenuCategory }>(
      `/api/menu/categories/${id}`,
      data
    )
    return res.category
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update category')
  }
})

// Delete Category
export const deleteCategoryThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('menu/deleteCategory', async (categoryId, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/api/menu/categories/${categoryId}`)
    return categoryId
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to delete category')
  }
})

// Create Menu Item
export const createMenuItemThunk = createAsyncThunk<
  MenuItem,
  CreateItemPayload,
  { rejectValue: string }
>('menu/createMenuItem', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<{ success: boolean; item: MenuItem }>(
      '/api/menu/items',
      payload
    )
    return res.item
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to create menu item')
  }
})

// Update Menu Item
export const updateMenuItemThunk = createAsyncThunk<
  MenuItem,
  UpdateItemPayload,
  { rejectValue: string }
>('menu/updateMenuItem', async (payload, { rejectWithValue }) => {
  try {
    const { id, ...data } = payload
    const res = await apiClient.patch<{ success: boolean; item: MenuItem }>(
      `/api/menu/items/${id}`,
      data
    )
    return res.item
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update menu item')
  }
})

// Quick Toggle Item Availability
export const toggleItemAvailabilityThunk = createAsyncThunk<
  MenuItem,
  { id: string; isAvailable: boolean },
  { rejectValue: string }
>('menu/toggleAvailability', async ({ id, isAvailable }, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch<{ success: boolean; item: MenuItem }>(
      `/api/menu/items/${id}`,
      { isAvailable }
    )
    return res.item
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to toggle availability')
  }
})

// Delete Menu Item
export const deleteMenuItemThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('menu/deleteMenuItem', async (itemId, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/api/menu/items/${itemId}`)
    return itemId
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to delete menu item')
  }
})
