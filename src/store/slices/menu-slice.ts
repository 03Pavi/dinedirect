import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MenuCategory, MenuItem, MenuState } from '@/types/menu-types'
import {
  fetchMenuThunk,
  createCategoryThunk,
  updateCategoryThunk,
  deleteCategoryThunk,
  createMenuItemThunk,
  updateMenuItemThunk,
  toggleItemAvailabilityThunk,
  deleteMenuItemThunk,
} from '../thunks/menu-thunks'

const initialState: MenuState = {
  categories: [],
  items: [],
  loading: false,
  error: null,
}

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<MenuCategory[]>) => {
      state.categories = action.payload
    },
    setItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.items = action.payload
    },
    setMenuLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setMenuError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetMenuState: () => initialState,
  },
  extraReducers: (builder) => {
    // fetchMenu
    builder.addCase(fetchMenuThunk.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchMenuThunk.fulfilled, (state, action) => {
      state.loading = false
      state.categories = action.payload.categories
      state.items = action.payload.items
    })
    builder.addCase(fetchMenuThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload || 'Failed to fetch menu'
    })

    // createCategory
    builder.addCase(createCategoryThunk.fulfilled, (state, action) => {
      state.categories.push(action.payload)
    })

    // updateCategory
    builder.addCase(updateCategoryThunk.fulfilled, (state, action) => {
      const idx = state.categories.findIndex((c) => c.id === action.payload.id)
      if (idx !== -1) {
        state.categories[idx] = {
          ...state.categories[idx],
          ...action.payload,
        }
      }
    })

    // deleteCategory
    builder.addCase(deleteCategoryThunk.fulfilled, (state, action) => {
      const catId = action.payload
      state.categories = state.categories.filter((c) => c.id !== catId)
      state.items = state.items.filter((i) => i.categoryId !== catId)
    })

    // createMenuItem
    builder.addCase(createMenuItemThunk.fulfilled, (state, action) => {
      state.items.unshift(action.payload)
      const cat = state.categories.find((c) => c.id === action.payload.categoryId)
      if (cat) {
        if (!cat.items) cat.items = []
        cat.items.unshift(action.payload)
      }
    })

    // updateMenuItem
    builder.addCase(updateMenuItemThunk.fulfilled, (state, action) => {
      const updated = action.payload
      const idx = state.items.findIndex((i) => i.id === updated.id)
      if (idx !== -1) {
        state.items[idx] = updated
      }
      state.categories.forEach((cat) => {
        if (cat.items) {
          const itemIdx = cat.items.findIndex((i) => i.id === updated.id)
          if (itemIdx !== -1) {
            if (cat.id === updated.categoryId) {
              cat.items[itemIdx] = updated
            } else {
              cat.items.splice(itemIdx, 1)
            }
          } else if (cat.id === updated.categoryId) {
            cat.items.push(updated)
          }
        }
      })
    })

    // toggleItemAvailability
    builder.addCase(toggleItemAvailabilityThunk.fulfilled, (state, action) => {
      const updated = action.payload
      const item = state.items.find((i) => i.id === updated.id)
      if (item) {
        item.isAvailable = updated.isAvailable
      }
      state.categories.forEach((cat) => {
        const catItem = cat.items?.find((i) => i.id === updated.id)
        if (catItem) {
          catItem.isAvailable = updated.isAvailable
        }
      })
    })

    // deleteMenuItem
    builder.addCase(deleteMenuItemThunk.fulfilled, (state, action) => {
      const itemId = action.payload
      state.items = state.items.filter((i) => i.id !== itemId)
      state.categories.forEach((cat) => {
        if (cat.items) {
          cat.items = cat.items.filter((i) => i.id !== itemId)
        }
      })
    })
  },
})

export const {
  setCategories,
  setItems,
  setMenuLoading,
  setMenuError,
  resetMenuState,
} = menuSlice.actions

export const menuReducer = menuSlice.reducer
export default menuSlice.reducer
