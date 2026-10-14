export interface KeywordData {
  id: string
  keyword: string
  category: string
  sortOrder: number
  isTrending: boolean
}

export const DEFAULT_KEYWORDS: KeywordData[] = [
  { id: '1', keyword: 'Biryani', category: 'trending', sortOrder: 1, isTrending: true },
  { id: '2', keyword: 'Pizza', category: 'trending', sortOrder: 2, isTrending: true },
  { id: '3', keyword: 'Burger', category: 'trending', sortOrder: 3, isTrending: true },
  { id: '4', keyword: 'Paneer', category: 'trending', sortOrder: 4, isTrending: true },
  { id: '5', keyword: 'Momos', category: 'trending', sortOrder: 5, isTrending: true },
  { id: '6', keyword: 'Rolls', category: 'trending', sortOrder: 6, isTrending: true },
  { id: '7', keyword: 'Thali', category: 'trending', sortOrder: 7, isTrending: true },
  { id: '8', keyword: 'Cold Coffee', category: 'trending', sortOrder: 8, isTrending: true },
]
