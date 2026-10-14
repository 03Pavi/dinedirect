export interface MenuItem {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  imageUrl?: string | null
  isVeg: boolean
  isAvailable: boolean
  prepTimeMins: number
}

export interface MenuCategory {
  id: string
  restaurantId: string
  name: string
  sortOrder: number
  items?: MenuItem[]
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface PaginatedItemsResponse<T = MenuItem> {
  items: T[]
  pagination?: PaginationInfo
}

export interface MenuState {
  categories: MenuCategory[]
  items: MenuItem[]
  loading: boolean
  error: string | null
}

export interface CreateCategoryPayload {
  restaurantId: string
  name: string
  sortOrder?: number
}

export interface UpdateCategoryPayload {
  id: string
  name: string
  sortOrder?: number
}

export interface CreateItemPayload {
  categoryId: string
  name: string
  description: string
  price: number
  imageUrl?: string
  isVeg: boolean
  isAvailable?: boolean
  prepTimeMins?: number
}

export interface UpdateItemPayload extends Partial<CreateItemPayload> {
  id: string
}
