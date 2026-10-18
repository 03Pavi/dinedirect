'use client'

import React, { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Drawer,
  Typography,
  Chip,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  Badge,
  Card,
  Skeleton,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { CustomerSidebar } from '@/components/customer/customer-sidebar'
import { CustomerHeader } from '@/components/customer/customer-header'
import { CustomerBanner } from '@/components/customer/customer-banner'
import { RestaurantAvatarRow } from '@/components/customer/restaurant-avatar-row'
import { RestaurantCard } from '@/components/customer/restaurant-card'
import { DishCard, ExtendedMenuItem } from '@/components/customer/dish-card'
import { CartSidebar } from '@/components/customer/cart-sidebar'

import { Restaurant } from '@/types/restaurant-types'
import { apiClient } from '@/utils/api-client'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, updateQuantity } from '@/store/slices/cart-slice'
import { useHistoryModal } from '@/hooks/use-history-modal'
import { useDebounce } from '@/hooks/use-debounce'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantIdParam = searchParams.get('restaurantId')

  const dispatch = useAppDispatch()
  const cart = useAppSelector((state) => state.cart)

  // View Mode synced with URL query (?dishes=true)
  const isDishes = searchParams.get('dishes') === 'true'
  const viewMode: 'restaurants' | 'dishes' = isDishes ? 'dishes' : 'restaurants'

  const handleViewModeChange = (mode: 'restaurants' | 'dishes') => {
    if (mode === 'dishes') {
      router.push('/home?dishes=true', { scroll: false })
    } else {
      router.push('/home', { scroll: false })
    }
  }

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    router.push(`/restaurant/${restaurant.id}`)
  }

  // Navigation & Search Filters
  const [activeNav, setActiveNav] = useState('Home')
  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  
  // Responsive Drawer States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const debouncedSearch = useDebounce(searchQuery, 300)


  // Back-button history interception for mobile drawers
  useHistoryModal({
    open: mobileSidebarOpen,
    onClose: () => setMobileSidebarOpen(false),
    modalId: 'mobile-sidebar',
  })
  useHistoryModal({
    open: mobileCartOpen,
    onClose: () => setMobileCartOpen(false),
    modalId: 'mobile-cart',
  })

  // If arriving via Table QR Code or direct ?restaurantId=, redirect directly to the restaurant page
  useEffect(() => {
    if (restaurantIdParam) {
      const qs = searchParams.toString()
      router.replace(`/restaurant/${restaurantIdParam}${qs ? `?${qs}` : ''}`)
    }
  }, [restaurantIdParam, router, searchParams])

  // Record QR Scan event if arriving via Table QR Code
  useEffect(() => {
    const qrId = searchParams.get('qrId')
    if (qrId) {
      fetch('/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrId }),
      }).catch(() => {})
    }
  }, [searchParams])

  // Dynamic Database Data States
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [allItems, setAllItems] = useState<ExtendedMenuItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch Real Restaurants & Menu Items from API
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [restRes, itemRes] = await Promise.all([
          apiClient.get<{ restaurants: Restaurant[] }>('/api/restaurants'),
          apiClient.get<{ items: ExtendedMenuItem[] }>('/api/menu/items'),
        ])

        const fetchedRestaurants = restRes.restaurants || []
        const fetchedItems = itemRes.items || []

        setRestaurants(fetchedRestaurants)
        setAllItems(fetchedItems)
      } catch (err) {
        console.error('Failed to load menu data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Extract unique category names from real dishes
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    allItems.forEach((it) => {
      if (it.category?.name) set.add(it.category.name)
    })
    return Array.from(set)
  }, [allItems])

  // Filtered Restaurants based on debounced search query
  const filteredRestaurants = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim()
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
  }, [restaurants, debouncedSearch])

  // Filtered Dishes based on debounced search, category, and veg filter
  const filteredDishes = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim()
    return allItems.filter((item) => {
      if (vegOnly && !item.isVeg) return false
      if (selectedCategory !== 'ALL' && item.category?.name !== selectedCategory) {
        return false
      }
      if (!q) return true
      const matchName = item.name?.toLowerCase().includes(q)
      const matchDesc = item.description?.toLowerCase().includes(q)
      const matchRest = item.category?.restaurant?.name?.toLowerCase().includes(q)
      return matchName || matchDesc || matchRest
    })
  }, [allItems, debouncedSearch, vegOnly, selectedCategory])

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
      {/* 1. LEFT SIDEBAR: Permanent on Desktop (md+) */}
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
        <CustomerSidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      </Box>

      {/* LEFT SIDEBAR: Temporary Drawer on Mobile/Tablet */}
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 260 } }}
      >
        <CustomerSidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onItemClick={() => setMobileSidebarOpen(false)}
        />
      </Drawer>

      {/* 2. CENTER CONTENT AREA: Responsive main column */}
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
        {/* Sticky Customer Header */}
        <CustomerHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          dishes={allItems}
          restaurants={restaurants}
          onSelectRestaurant={handleSelectRestaurant}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenMobileCart={() => setMobileCartOpen(true)}
          cartItemCount={totalCartCount}
        />

        {/* Scrollable Feed Container */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, flex: 1 }}>
          {/* Promo Banner Carousel */}
          <CustomerBanner />

          {/* Popular Brands Horizontal Scroll Row */}
          <RestaurantAvatarRow
            restaurants={restaurants}
            onSelectRestaurant={handleSelectRestaurant}
            isLoading={loading}
          />

          {/* Mobile View Switcher (Restaurants vs Dishes pills for small screens) */}
          <Box
            sx={{
              display: { xs: 'flex', lg: 'none' },
              bgcolor: '#ffffff',
              p: 0.5,
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              mb: 3,
            }}
          >
            <Button
              fullWidth
              size="small"
              onClick={() => handleViewModeChange('restaurants')}
              startIcon={<StorefrontIcon fontSize="small" />}
              sx={{
                borderRadius: '12px',
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: viewMode === 'restaurants' ? '#ea580c' : 'transparent',
                color: viewMode === 'restaurants' ? '#ffffff' : '#64748b',
                '&:hover': {
                  bgcolor: viewMode === 'restaurants' ? '#c2410c' : '#f1f5f9',
                },
              }}
            >
              Restaurants
            </Button>
            <Button
              fullWidth
              size="small"
              onClick={() => handleViewModeChange('dishes')}
              startIcon={<RestaurantMenuIcon fontSize="small" />}
              sx={{
                borderRadius: '12px',
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: viewMode === 'dishes' ? '#ea580c' : 'transparent',
                color: viewMode === 'dishes' ? '#ffffff' : '#64748b',
                '&:hover': {
                  bgcolor: viewMode === 'dishes' ? '#c2410c' : '#f1f5f9',
                },
              }}
            >
              Dishes
            </Button>
          </Box>

          {/* Category Pills & Veg Only Filter Bar */}
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
            {/* Horizontal Category Chips */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                overflowX: 'auto',
                maxWidth: { xs: '100%', md: '75%' },
                pb: 0.5,
                '::-webkit-scrollbar': { height: 4 },
                '::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 4 },
              }}
            >
              <Chip
                label="All"
                onClick={() => setSelectedCategory('ALL')}
                sx={{
                  fontWeight: 700,
                  bgcolor: selectedCategory === 'ALL' ? '#ea580c' : '#ffffff',
                  color: selectedCategory === 'ALL' ? '#ffffff' : '#475569',
                  border: '1.5px solid',
                  borderColor: selectedCategory === 'ALL' ? '#ea580c' : '#e2e8f0',
                  '&:hover': {
                    bgcolor: selectedCategory === 'ALL' ? '#c2410c' : '#f1f5f9',
                  },
                }}
              />
              {availableCategories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    fontWeight: 700,
                    bgcolor: selectedCategory === cat ? '#ea580c' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                    border: '1.5px solid',
                    borderColor: selectedCategory === cat ? '#ea580c' : '#e2e8f0',
                    '&:hover': {
                      bgcolor: selectedCategory === cat ? '#c2410c' : '#f1f5f9',
                    },
                  }}
                />
              ))}
            </Box>

            {/* Veg Only Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                  color="success"
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                  Veg Only 🌱
                </Typography>
              }
              sx={{ mr: 0 }}
            />
          </Box>

          {/* Feed Content Area */}
          {loading ? (
            /* SKELETON FEED LOADERS (NO CIRCULAR PROGRESS) */
            viewMode === 'restaurants' ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WhatshotIcon sx={{ color: '#ea580c', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                        In the Spotlight!
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Explore verified partner kitchens and popular eateries
                    </Typography>
                  </Box>
                  <Skeleton variant="rounded" width={110} height={24} sx={{ borderRadius: '12px' }} />
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: 3,
                  }}
                >
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Card
                      key={idx}
                      elevation={0}
                      sx={{
                        borderRadius: '16px',
                        border: '1.5px solid #f1f5f9',
                        bgcolor: '#ffffff',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                    >
                      <Skeleton variant="rectangular" animation="wave" height={160} sx={{ bgcolor: '#f1f5f9' }} />
                      <Box sx={{ p: 2 }}>
                        <Skeleton variant="text" animation="wave" width="65%" height={26} sx={{ mb: 1, borderRadius: '4px' }} />
                        <Skeleton variant="text" animation="wave" width="40%" height={18} sx={{ mb: 2, borderRadius: '4px' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #f8fafc' }}>
                          <Skeleton variant="text" animation="wave" width={80} height={18} sx={{ borderRadius: '4px' }} />
                          <Skeleton variant="rounded" animation="wave" width={75} height={28} sx={{ borderRadius: '8px' }} />
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <RestaurantMenuIcon sx={{ color: '#ea580c', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                        Explore Delicious Dishes
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Order individual dishes directly from local menus
                    </Typography>
                  </Box>
                  <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: '12px' }} />
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: 2.5,
                  }}
                >
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Card
                      key={idx}
                      elevation={0}
                      sx={{
                        borderRadius: '16px',
                        border: '1.5px solid #f1f5f9',
                        bgcolor: '#ffffff',
                        overflow: 'hidden',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                      }}
                    >
                      <Skeleton variant="rectangular" animation="wave" height={150} sx={{ borderRadius: '12px', bgcolor: '#f1f5f9' }} />
                      <Box>
                        <Skeleton variant="text" animation="wave" width="70%" height={24} sx={{ borderRadius: '4px', mb: 0.5 }} />
                        <Skeleton variant="text" animation="wave" width="45%" height={16} sx={{ borderRadius: '4px', mb: 1.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Skeleton variant="text" animation="wave" width={60} height={26} sx={{ borderRadius: '4px' }} />
                          <Skeleton variant="rounded" animation="wave" width={80} height={32} sx={{ borderRadius: '20px' }} />
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )
          ) : viewMode === 'restaurants' ? (
            /* 1. RESTAURANTS VIEW */
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <WhatshotIcon sx={{ color: '#ea580c', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      In the Spotlight!
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Explore verified partner kitchens and popular eateries
                  </Typography>
                </Box>
                <Chip
                  label={`${filteredRestaurants.length} Restaurants`}
                  size="small"
                  sx={{ bgcolor: '#fff7ed', color: '#ea580c', fontWeight: 700 }}
                />
              </Box>

              {filteredRestaurants.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px dashed #e2e8f0',
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    No restaurants match your search
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Try another keyword or clear search filters.
                  </Typography>
                </Box>
              ) : (
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
                      onExplore={handleSelectRestaurant}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            /* 2. DISHES VIEW */
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <RestaurantMenuIcon sx={{ color: '#ea580c', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      Explore Delicious Dishes
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Order individual dishes directly from local menus
                  </Typography>
                </Box>
                <Chip
                  label={`${filteredDishes.length} Items`}
                  size="small"
                  sx={{ bgcolor: '#fff7ed', color: '#ea580c', fontWeight: 700 }}
                />
              </Box>

              {filteredDishes.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px dashed #e2e8f0',
                  }}
                >
                  <RestaurantMenuIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    No dishes found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Try a different search term or category.
                  </Typography>
                </Box>
              ) : (
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
                        onSelectRestaurant={handleSelectRestaurant}
                      />
                    )
                  })}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* 3. RIGHT SIDEBAR: "Order Menu" Permanent on Desktop (lg+) */}
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

      {/* RIGHT SIDEBAR: "Order Menu" Temporary Drawer on Mobile & Tablet */}
      <Drawer
        anchor="right"
        open={mobileCartOpen}
        onClose={() => setMobileCartOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 380 } } }}
      >
        <CartSidebar onClose={() => setMobileCartOpen(false)} isDrawer />
      </Drawer>

      {/* Floating Bottom Cart Bar for Mobile when Cart has items */}
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
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} added
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Rs {cart.subtotal}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, pl: 1, borderLeft: '1px solid rgba(255,255,255,0.4)' }}>
              View →
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ p: 4 }}>
          <Skeleton variant="rounded" height={60} sx={{ mb: 3, borderRadius: '16px' }} />
          <Skeleton variant="rectangular" height={220} sx={{ mb: 3, borderRadius: '16px' }} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} variant="rectangular" height={200} sx={{ borderRadius: '16px' }} />
            ))}
          </Box>
        </Box>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
