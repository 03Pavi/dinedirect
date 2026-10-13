import { RootState } from '../store'

export const selectMenuCategories = (state: RootState) => state.menu.categories
export const selectMenuItems = (state: RootState) => state.menu.items
export const selectMenuLoading = (state: RootState) => state.menu.loading
export const selectMenuError = (state: RootState) => state.menu.error
