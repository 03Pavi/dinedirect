'use client'

import React, { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Drawer,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Stack,
  Badge,
  Card,
  Skeleton,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import StorefrontIcon from '@mui/icons-material/Storefront'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import MenuIcon from '@mui/icons-material/Menu'
import SettingsIcon from '@mui/icons-material/Settings'
import { CustomerSidebar } from '@/components/customer/customer-sidebar'
import { RestaurantCard } from '@/components/customer/restaurant-card'
import { DishCard, ExtendedMenuItem } from '@/components/customer/dish-card'
import { CartSidebar } from '@/components/customer/cart-sidebar'
import { KeywordManagerDialog, KeywordItem } from '@/components/customer/keyword-manager-dialog'

import { Restaurant } from '@/types/restaurant-types'
import { apiClient } from '@/utils/api-client'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, updateQuantity } from '@/store/slices/cart-slice'
import { useHistoryModal } from '@/hooks/use-history-modal'
import { useDebounce } from '@/hooks/use-debounce'

const INITIAL_KEYWORDS: KeywordItem[] = [
  { id: '1', keyword: 'Biryani', category: 'trending', sortOrder: 1 },
  { id: '2', keyword: 'Pizza', category: 'trending', sortOrder: 2 },
  { id: '3', keyword: 'Burger', category: 'trending', sortOrder: 3 },
  { id: '4', keyword: 'Paneer', category: 'trending', sortOrder: 4 },
  { id: '5', keyword: 'Momos', category: 'trending', sortOrder: 5 },
  { id: '6', keyword: 'Rolls', category: 'trending', sortOrder: 6 },
  { id: '7', keyword: 'Thali', category: 'trending', sortOrder: 7 },
  { id: '8', keyword: 'Cold Coffee', category: 'trending', sortOrder: 8 },
]

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const dispatch = useAppDispatch()
  const cart = useAppSelector((state) => state.cart)

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const shouldFocus = searchParams.get('focus') === 'true'

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus()
    }, 120)
    return () => clearTimeout(timer)
  }, [shouldFocus])

  // Debounce search query by 300ms to avoid re-filtering on every keystroke
  const debouncedQuery = useDebounce(searchQuery, 300)
  const isDebouncing = searchQuery !== debouncedQuery

  const [activeTab, setActiveTab] = useState<'all' | 'dishes' | 'restaurants'>('all')
  const [vegOnly, setVegOnly] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [allItems, setAllItems] = useState<ExtendedMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [trendingKeywords, setTrendingKeywords] = useState<KeywordItem[]>(INITIAL_KEYWORDS)
  const [keywordManagerOpen, setKeywordManagerOpen] = useState(false)

  // Responsive Drawer States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  useHistoryModal({
    open: mobileSidebarOpen,
    onClose: () => setMobileSidebarOpen(false),
    modalId: 'mobile-sidebar-search',
  })
  useHistoryModal({
    open: mobileCartOpen,
    onClose: () => setMobileCartOpen(false),
    modalId: 'mobile-cart-search',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [restRes, itemRes, kwRes] = await Promise.all([
          apiClient.get<{ restaurants: Restaurant[] }>('/api/restaurants'),
          apiClient.get<{ items: ExtendedMenuItem[] }>('/api/menu/items'),
          apiClient
            .get<{ keywords: KeywordItem[] }>('/api/keywords')
            .catch(() => ({ data: { keywords: INITIAL_KEYWORDS } } as any)),
        ])
        setRestaurants(restRes.restaurants || [])
        setAllItems(itemRes.items || [])
        const fetchedKeywords = (kwRes as any)?.data?.keywords || (kwRes as any)?.keywords
        if (Array.isArray(fetchedKeywords) && fetchedKeywords.length > 0) {
          setTrendingKeywords(fetchedKeywords)
        }
      } catch (err) {
        console.error('Failed to load search data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filtered Restaurants based on debounced search query
  const filteredRestaurants = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()
    return restaurants.filter((r) => {
      if (!q) return true
      const matchName = r.name?.toLowerCase().includes(q)
      const matchCity = r.city?.toLowerCase().includes(q)
      const cuisineData = r.cuisine as any
      const matchCuisine =
        typeof cuisineData === 'string'
          ? cuisineData.toLowerCase().includes(q)
          : Array.isArray(cuisineData)
            ? cuisineData.some((c: any) => String(c || '').toLowerCase().includes(q))
            : false
      return matchName || matchCity || matchCuisine
    })
  }, [restaurants, debouncedQuery])

  // Filtered Dishes based on debounced search query
  const filteredDishes = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()
    return allItems.filter((item) => {
      if (vegOnly && !item.isVeg) return false
      if (!q) return true
      const matchName = item.name?.toLowerCase().includes(q)
      const matchDesc = item.description?.toLowerCase().includes(q)
      const matchRest = item.category?.restaurant?.name?.toLowerCase().includes(q)
      const matchCat = item.category?.name?.toLowerCase().includes(q)
      return matchName || matchDesc || matchRest || matchCat
    })
  }, [allItems, debouncedQuery, vegOnly])

  // Cart Handlers
  const handleAddToCart = (item: ExtendedMenuItem) => {
    if (item.category?.restaurant?.isOpen === false || item.isAvailable === false) {
      return
    }

    const restId =
      item.category?.restaurantId || item.category?.restaurant?.id || 'default-restaurant'
    const restName = item.category?.restaurant?.name || 'Restaurant'

    dispatch(
      addItem({
        restaurantId: restId,
        restaurantName: restName,
        item: {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          isVeg: item.isVeg,
          imageUrl: item.imageUrl,
        },
      })
    )
  }

  const handleUpdateQuantity = (menuItemId: string, newQty: number) => {
    dispatch(updateQuantity({ menuItemId, quantity: newQty }))
  }

  const totalCartCount = cart.items.reduce((sum, it) => sum + it.quantity, 0)

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#f8fafc' }}>
      {/* 1. LEFT SIDEBAR */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 220,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
        }}
      >
        <CustomerSidebar activeNav="Search" />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 260 } }}
      >
        <CustomerSidebar activeNav="Search" onItemClick={() => setMobileSidebarOpen(false)} />
      </Drawer>

      {/* 2. CENTER CONTENT */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          borderRight: { lg: '1px solid #f1f5f9' },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, flex: 1 }}>
          {/* Main Search Input Hero */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => setMobileSidebarOpen(true)}
                  sx={{ display: { xs: 'flex', md: 'none' }, color: '#0f172a', p: 0.5 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Search Food & Restaurants
                </Typography>
              </Box>
              <IconButton
                onClick={() => setMobileCartOpen(true)}
                sx={{ display: { xs: 'flex', md: 'none' }, color: '#0f172a' }}
              >
                <Badge badgeContent={totalCartCount} color="error">
                  <ShoppingBagIcon />
                </Badge>
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Find your favorite cravings, kitchens, and local dishes instantly
            </Typography>

            <TextField
              fullWidth
              inputRef={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for restaurants, cuisines, or dishes..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#ea580c', fontSize: 24 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {isDebouncing && (
                      <CircularProgress size={16} sx={{ color: '#ea580c', mr: 1 }} />
                    )}
                    {searchQuery ? (
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    ) : null}
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '16px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                },
              }}
            />

            {/* Trending Keywords Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#ea580c', mr: 0.5 }}>
                <LocalFireDepartmentIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  Trending:
                </Typography>
              </Stack>
              {trendingKeywords.map((item) => (
                <Chip
                  key={item.id || item.keyword}
                  label={item.keyword}
                  size="small"
                  onClick={() => setSearchQuery(item.keyword)}
                  sx={{
                    bgcolor: searchQuery.toLowerCase() === item.keyword.toLowerCase() ? '#ea580c' : '#ffffff',
                    color: searchQuery.toLowerCase() === item.keyword.toLowerCase() ? '#ffffff' : '#475569',
                    border: '1px solid #e2e8f0',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#fff7ed', borderColor: '#ea580c' },
                  }}
                />
              ))}

              {/* Admin Manage Keywords Collection */}
              <Chip
                icon={<SettingsIcon sx={{ fontSize: '14px !important', color: '#ea580c !important' }} />}
                label="Manage"
                size="small"
                onClick={() => setKeywordManagerOpen(true)}
                sx={{
                  bgcolor: '#fff7ed',
                  color: '#ea580c',
                  border: '1px dashed #fdba74',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#ffedd5', borderColor: '#ea580c' },
                }}
              />
            </Box>
          </Box>

          {/* Filter Pills (All / Dishes / Restaurants / Veg Only) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              mb: 3,
              pb: 1.5,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              sx={{
                minHeight: 'auto',
                '& .MuiTabs-indicator': { bgcolor: '#ea580c' },
              }}
            >
              <Tab
                label={`All (${filteredDishes.length + filteredRestaurants.length})`}
                value="all"
                sx={{ fontWeight: 700, textTransform: 'none', minHeight: 40, px: 2 }}
              />
              <Tab
                label={`Dishes (${filteredDishes.length})`}
                value="dishes"
                sx={{ fontWeight: 700, textTransform: 'none', minHeight: 40, px: 2 }}
              />
              <Tab
                label={`Restaurants (${filteredRestaurants.length})`}
                value="restaurants"
                sx={{ fontWeight: 700, textTransform: 'none', minHeight: 40, px: 2 }}
              />
            </Tabs>

            <Chip
              label="Veg Only 🌱"
              onClick={() => setVegOnly(!vegOnly)}
              sx={{
                bgcolor: vegOnly ? '#16a34a' : '#ffffff',
                color: vegOnly ? '#ffffff' : '#16a34a',
                border: '1.5px solid #16a34a',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            />
          </Box>

          {/* Loading Skeletons */}
          {loading ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 3,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Box key={i}>
                  <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '16px', mb: 1 }} />
                  <Skeleton variant="text" width="70%" height={24} />
                  <Skeleton variant="text" width="40%" height={18} />
                </Box>
              ))}
            </Box>
          ) : filteredRestaurants.length === 0 && filteredDishes.length === 0 ? (
            /* Empty State */
            <Box
              sx={{
                textAlign: 'center',
                py: 10,
                bgcolor: '#ffffff',
                borderRadius: '20px',
                border: '1.5px dashed #e2e8f0',
                px: 3,
              }}
            >
              <SearchIcon sx={{ fontSize: 56, color: '#94a3b8', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                No results found for &ldquo;{searchQuery}&rdquo;
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                Try checking for typos or searching with another keyword.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery('')
                  setVegOnly(false)
                }}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderColor: '#ea580c',
                  color: '#ea580c',
                }}
              >
                Clear Search Filters
              </Button>
            </Box>
          ) : (
            <Stack spacing={4}>
              {/* 1. Restaurants Section */}
              {(activeTab === 'all' || activeTab === 'restaurants') && filteredRestaurants.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                    Restaurants ({filteredRestaurants.length})
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                      gap: 3,
                    }}
                  >
                    {filteredRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onExplore={(r) => router.push(`/restaurant/${r.id}`)}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* 2. Dishes Section */}
              {(activeTab === 'all' || activeTab === 'dishes') && filteredDishes.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                    Dishes ({filteredDishes.length})
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                      gap: 2.5,
                    }}
                  >
                    {filteredDishes.map((dish) => {
                      const inCart = cart.items.find((i) => i.menuItemId === dish.id)
                      const qty = inCart ? inCart.quantity : 0

                      return (
                        <DishCard
                          key={dish.id}
                          item={dish}
                          quantityInCart={qty}
                          onAddToCart={handleAddToCart}
                          onUpdateQuantity={handleUpdateQuantity}
                          onSelectRestaurant={(r) => router.push(`/restaurant/${r.id}`)}
                        />
                      )
                    })}
                  </Box>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>

      {/* 3. RIGHT SIDEBAR */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: 350,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 90,
        }}
      >
        <CartSidebar />
      </Box>

      <Drawer
        anchor="right"
        open={mobileCartOpen}
        onClose={() => setMobileCartOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 380 } } }}
      >
        <CartSidebar onClose={() => setMobileCartOpen(false)} isDrawer />
      </Drawer>

      {/* Floating Bottom Cart Bar */}
      {cart.items.length > 0 && (
        <Box
          sx={{
            display: { xs: 'flex', lg: 'none' },
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 1000,
            bgcolor: '#ea580c',
            color: '#ffffff',
            borderRadius: '16px',
            p: 1.8,
            boxShadow: '0 12px 28px rgba(234, 88, 12, 0.45)',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setMobileCartOpen(true)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Badge badgeContent={totalCartCount} color="default">
              <ShoppingBagIcon sx={{ color: '#ffffff' }} />
            </Badge>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} added
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Rs {cart.subtotal} →
          </Typography>
        </Box>
      )}

      {/* Admin Keyword Manager Dialog */}
      <KeywordManagerDialog
        open={keywordManagerOpen}
        onClose={() => setKeywordManagerOpen(false)}
        keywords={trendingKeywords}
        onKeywordsChange={setTrendingKeywords}
      />
    </Box>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Box sx={{ p: 4 }}><Skeleton variant="rounded" height={60} /></Box>}>
      <SearchContent />
    </Suspense>
  )
}
