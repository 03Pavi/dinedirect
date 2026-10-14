'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  CircularProgress,
  Stack,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PhoneIcon from '@mui/icons-material/Phone'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Restaurant } from '@/types/restaurant-types'
import { MenuCategory, PaginatedItemsResponse } from '@/types/menu-types'
import { ExtendedMenuItem, DishCard } from './dish-card'
import { apiClient } from '@/utils/api-client'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, updateQuantity } from '@/store/slices/cart-slice'

interface RestaurantDetailViewProps {
  restaurant: Restaurant
  tableNumber?: string | null
  onBack: () => void
}

export function RestaurantDetailView({ restaurant, tableNumber, onBack }: RestaurantDetailViewProps) {
  const dispatch = useAppDispatch()
  const cart = useAppSelector((state) => state.cart)

  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<ExtendedMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [vegOnly, setVegOnly] = useState(false)

  // Server-side Pagination State (10 items per page)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // 1. Fetch Categories for the restaurant
  useEffect(() => {
    async function fetchCategories() {
      try {
        const catRes = await apiClient.get<{ categories: MenuCategory[] }>(
          `/api/menu/categories?restaurantId=${restaurant.id}`
        )
        setCategories(catRes.categories || [])
      } catch (err) {
        console.error('Failed to load menu categories:', err)
      }
    }
    fetchCategories()
  }, [restaurant.id])

  // 2. Fetch Initial 10 Items from Server on filter/category change
  useEffect(() => {
    let active = true
    setLoading(true)
    setPage(1)

    const params = new URLSearchParams({
      restaurantId: restaurant.id,
      page: '1',
      limit: '10',
    })
    if (selectedCategory !== 'ALL') {
      params.set('categoryId', selectedCategory)
    }
    if (vegOnly) {
      params.set('isVeg', 'true')
    }

    apiClient
      .get<PaginatedItemsResponse<ExtendedMenuItem>>(`/api/menu/items?${params.toString()}`)
      .then((res) => {
        if (!active) return
        setItems(res.items || [])
        setHasMore(Boolean(res.pagination?.hasMore))
        if (res.pagination?.total !== undefined) {
          setTotalCount(res.pagination.total)
        }
      })
      .catch((err) => {
        console.error('Failed to load menu items:', err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [restaurant.id, selectedCategory, vegOnly])

  // 3. Fetch Next Page of Items (Load More / Infinite Scroll)
  const handleLoadMore = async () => {
    if (loading || loadingMore || !hasMore) return

    const nextPage = page + 1
    setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        restaurantId: restaurant.id,
        page: String(nextPage),
        limit: '10',
      })
      if (selectedCategory !== 'ALL') {
        params.set('categoryId', selectedCategory)
      }
      if (vegOnly) {
        params.set('isVeg', 'true')
      }

      const res = await apiClient.get<PaginatedItemsResponse<ExtendedMenuItem>>(
        `/api/menu/items?${params.toString()}`
      )

      const newItems = res.items || []
      const pagination = res.pagination

      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id))
        const filteredNew = newItems.filter((i) => !existingIds.has(i.id))
        return [...prev, ...filteredNew]
      })

      setPage(nextPage)
      setHasMore(Boolean(pagination?.hasMore))
      if (pagination?.total !== undefined) {
        setTotalCount(pagination.total)
      }
    } catch (err) {
      console.error('Failed to load next page of dishes:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  // 4. Infinite Scroll Observer
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore()
        }
      },
      {
        rootMargin: '250px',
        threshold: 0.1,
      }
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [hasMore, loading, loadingMore, page, selectedCategory, vegOnly, restaurant.id])

  const handleAddToCart = (item: ExtendedMenuItem) => {
    if (!restaurant.isOpen || item.isAvailable === false) return

    dispatch(
      addItem({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
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

  const coverImage =
    restaurant.imageUrl ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'

  const cuisinesList = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine
    : typeof restaurant.cuisine === 'string'
      ? JSON.parse(restaurant.cuisine || '[]')
      : []

  return (
    <Box sx={{ pb: 6 }}>
      {/* Back button */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            color: '#0f172a',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            px: 1.5,
            py: 0.6,
            borderRadius: '10px',
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          Back to all restaurants
        </Button>
      </Box>

      {/* Restaurant Header Banner Card */}
      <Box
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          bgcolor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          mb: 3,
        }}
      >
        <Box sx={{ position: 'relative', height: { xs: 160, sm: 220 }, overflow: 'hidden' }}>
          <Box
            component="img"
            src={coverImage}
            alt={restaurant.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.1) 60%)',
            }}
          />
          <Chip
            label={restaurant.isOpen ? 'OPEN NOW' : 'CLOSED'}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: restaurant.isOpen ? '#22c55e' : '#64748b',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.75rem',
            }}
          />
          <Box sx={{ position: 'absolute', bottom: 16, left: { xs: 16, sm: 24 }, color: '#ffffff' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
              {restaurant.name}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: '#ea580c' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {restaurant.city || 'Nearby'}
                </Typography>
              </Box>
              {tableNumber && tableNumber.toLowerCase() !== 'menu' && (
                <Chip
                  icon={<QrCode2Icon sx={{ color: '#ffffff !important', fontSize: '15px !important' }} />}
                  label={`Dine-In: ${tableNumber}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(234, 88, 12, 0.95)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    height: 24,
                  }}
                />
              )}
              {restaurant.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PhoneIcon sx={{ fontSize: 16, color: '#ea580c' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {restaurant.phone}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Restaurant Sub-details */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            bgcolor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {cuisinesList.length > 0 ? (
              cuisinesList.map((c: string) => (
                <Chip
                  key={c}
                  label={c}
                  size="small"
                  sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}
                />
              ))
            ) : (
              <Chip
                label="Multi-Cuisine"
                size="small"
                sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <DeliveryDiningIcon sx={{ color: '#ea580c', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', lineHeight: 1 }}>
                  Delivery
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {restaurant.deliveryFee ? `₹${restaurant.deliveryFee}` : 'Free'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <AccessTimeIcon sx={{ color: '#ea580c', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', lineHeight: 1 }}>
                  Avg Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  25-30 mins
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Restaurant Closed Notice Banner */}
      {!restaurant.isOpen && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            mb: 3,
            borderRadius: '16px',
            bgcolor: '#fff1f2',
            border: '1.5px solid #fecdd3',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: '#ffe4e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <StorefrontIcon sx={{ color: '#e11d48', fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9f1239' }}>
              Restaurant is Currently Closed
            </Typography>
            <Typography variant="body2" sx={{ color: '#be123c', fontSize: '0.84rem' }}>
              This restaurant is not currently accepting orders. All items are disabled for ordering, but you can still view the menu.
            </Typography>
          </Box>
          <Chip
            label="CLOSED"
            size="small"
            sx={{
              bgcolor: '#e11d48',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
            }}
          />
        </Box>
      )}

      {/* Category Tabs & Veg Only Toggle */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          mb: 3,
          gap: 1.5,
        }}
      >
        <Tabs
          value={selectedCategory}
          onChange={(_, val) => setSelectedCategory(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#64748b',
              minWidth: 'auto',
              px: 2,
              '&.Mui-selected': {
                color: '#ea580c',
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#ea580c',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab
            label={totalCount > 0 ? `All Items (${totalCount})` : 'All Items'}
            value="ALL"
          />
          {categories.map((cat) => (
            <Tab key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Tabs>

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
          sx={{ mr: 1 }}
        />
      </Box>

      {/* Items Grid with Server-Side Pagination & Infinite Scroll */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#ea580c' }} />
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#ffffff', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
          <StorefrontIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            No dishes found in this category
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Try switching category or turning off the Veg Only filter.
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {items.map((item) => {
              const inCartItem = cart.items.find((i) => i.menuItemId === item.id)
              const qty = inCartItem ? inCartItem.quantity : 0

              return (
                <DishCard
                  key={item.id}
                  item={item}
                  disabled={!restaurant.isOpen || item.isAvailable === false}
                  disabledReason={!restaurant.isOpen ? 'STORE CLOSED' : !item.isAvailable ? 'OUT OF STOCK' : undefined}
                  quantityInCart={qty}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              )
            })}
          </Box>

          {/* Infinite Scroll Sentinel */}
          <Box ref={sentinelRef} sx={{ height: 20 }} />

          {/* Loading More Spinner */}
          {loadingMore && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                py: 3,
                bgcolor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                mt: 2,
              }}
            >
              <CircularProgress size={22} sx={{ color: '#ea580c' }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                Fetching next 10 dishes from kitchen...
              </Typography>
            </Box>
          )}

          {/* Manual Load More Button fallback */}
          {hasMore && !loadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                startIcon={<ExpandMoreIcon />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  px: 3.5,
                  py: 1.1,
                  borderColor: '#fed7aa',
                  color: '#ea580c',
                  bgcolor: '#fff7ed',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
                  '&:hover': {
                    bgcolor: '#ffedd5',
                    borderColor: '#ea580c',
                  },
                }}
              >
                Load Next 10 Dishes ({Math.max(0, totalCount - items.length)} remaining)
              </Button>
            </Box>
          )}

          {/* All Dishes Loaded Indicator */}
          {!hasMore && items.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 3, mt: 2 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                ✓ Showing all {items.length} dishes in this selection
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
