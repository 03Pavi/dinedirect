'use client'

import React, { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Box,
  Drawer,
  Typography,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Button,
  Stack,
  Badge,
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
import { RestaurantDetailView } from '@/components/customer/restaurant-detail-view'

import { Restaurant } from '@/types/restaurant-types'
import { apiClient } from '@/utils/api-client'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, updateQuantity } from '@/store/slices/cart-slice'
import { useHistoryModal } from '@/hooks/use-history-modal'

function MenuContent() {
  const searchParams = useSearchParams()
  const restaurantIdParam = searchParams.get('restaurantId')

  const dispatch = useAppDispatch()
  const cart = useAppSelector((state) => state.cart)

  // Navigation & View State
  const [activeNav, setActiveNav] = useState('Home')
  const [viewMode, setViewMode] = useState<'restaurants' | 'dishes'>('dishes')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [vegOnly, setVegOnly] = useState(false)

  // Responsive Drawer States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

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

  // Dynamic Database Data States
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [allItems, setAllItems] = useState<ExtendedMenuItem[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
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

        // If restaurantId is given via URL (e.g. Table QR scan), open that restaurant directly
        if (restaurantIdParam) {
          const matched = fetchedRestaurants.find((r) => r.id === restaurantIdParam)
          if (matched) {
            setSelectedRestaurant(matched)
          }
        }
      } catch (err) {
        console.error('Failed to load menu data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [restaurantIdParam])

  // Extract unique category names from real dishes
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    allItems.forEach((it) => {
      if (it.category?.name) set.add(it.category.name)
    })
    return Array.from(set)
  }, [allItems])

  // Filtered Restaurants based on search query
  const filteredRestaurants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
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
  }, [restaurants, searchQuery])

  // Filtered Dishes based on search, category, and veg filter
  const filteredDishes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
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
  }, [allItems, searchQuery, vegOnly, selectedCategory])

  // Cart Handlers
  const handleAddToCart = (item: ExtendedMenuItem) => {
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
          onViewModeChange={setViewMode}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenMobileCart={() => setMobileCartOpen(true)}
          cartItemCount={totalCartCount}
        />

        {/* Scrollable Feed Container */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, flex: 1 }}>
          {selectedRestaurant ? (
            /* Selected Restaurant Deep-Dive Detail View */
            <RestaurantDetailView
              restaurant={selectedRestaurant}
              onBack={() => setSelectedRestaurant(null)}
            />
          ) : (
            /* Main Discovery Page matching Reference UI */
            <>
              {/* Promo Banner Carousel */}
              <CustomerBanner />

              {/* Popular Brands Horizontal Scroll Row */}
              <RestaurantAvatarRow
                restaurants={restaurants}
                selectedRestaurantId={selectedRestaurant ? (selectedRestaurant as Restaurant).id : null}
                onSelectRestaurant={(r) => setSelectedRestaurant(r)}
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
                  onClick={() => setViewMode('restaurants')}
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
                  onClick={() => setViewMode('dishes')}
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
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                  <CircularProgress sx={{ color: '#ea580c' }} />
                </Box>
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
                    <Grid container spacing={3}>
                      {filteredRestaurants.map((restaurant) => (
                        <Grid item xs={12} sm={6} md={6} lg={4} key={restaurant.id}>
                          <RestaurantCard
                            restaurant={restaurant}
                            onExplore={(r) => setSelectedRestaurant(r)}
                          />
                        </Grid>
                      ))}
                    </Grid>
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
                    <Grid container spacing={2.5}>
                      {filteredDishes.map((dish) => {
                        const inCart = cart.items.find((i) => i.menuItemId === dish.id)
                        const qty = inCart ? inCart.quantity : 0

                        return (
                          <Grid item xs={12} sm={6} md={6} lg={4} key={dish.id}>
                            <DishCard
                              item={dish}
                              quantityInCart={qty}
                              onAddToCart={handleAddToCart}
                              onUpdateQuantity={handleUpdateQuantity}
                              onSelectRestaurant={(r) => setSelectedRestaurant(r)}
                            />
                          </Grid>
                        )
                      })}
                    </Grid>
                  )}
                </Box>
              )}
            </>
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
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                From {cart.restaurantName || 'Restaurant'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Rs {cart.subtotal}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, pl: 1, borderLeft: '1px solid rgba(255,255,255,0.4)' }}>
              View Order →
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress sx={{ color: '#ea580c' }} />
        </Box>
      }
    >
      <MenuContent />
    </Suspense>
  )
}
