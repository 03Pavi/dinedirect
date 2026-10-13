'use client'

import React, { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Skeleton,
  Badge,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import RestaurantIcon from '@mui/icons-material/Restaurant'

import Navbar from '@/components/common/navbar'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, updateQuantity } from '@/store/slices/cart-slice'
import { MenuItem, MenuCategory } from '@/types/menu-types'
import { Restaurant } from '@/types/restaurant-types'
import { apiClient } from '@/utils/api-client'

function MenuContent() {
  const searchParams = useSearchParams()
  const restaurantIdParam = searchParams.get('restaurantId')
  const tableParam = searchParams.get('table')

  const dispatch = useAppDispatch()
  const cart = useAppSelector((state) => state.cart)

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        let activeRestaurantId = restaurantIdParam

        // If no restaurantId given, fetch list of restaurants and use the first approved one
        if (!activeRestaurantId) {
          const res = await apiClient.get<{ restaurants: Restaurant[] }>('/api/restaurants')
          if (res.restaurants && res.restaurants.length > 0) {
            activeRestaurantId = res.restaurants[0].id
            setRestaurant(res.restaurants[0])
          }
        } else {
          // Fetch restaurant details
          const res = await apiClient.get<{ restaurants: Restaurant[] }>('/api/restaurants')
          const found = res.restaurants?.find((r) => r.id === activeRestaurantId)
          if (found) setRestaurant(found)
        }

        if (activeRestaurantId) {
          const catRes = await apiClient.get<{ categories: MenuCategory[] }>(
            `/api/menu/categories?restaurantId=${activeRestaurantId}`
          )
          const itemRes = await apiClient.get<{ items: MenuItem[] }>(
            `/api/menu/items?restaurantId=${activeRestaurantId}`
          )
          setCategories(catRes.categories || [])
          setItems(itemRes.items || [])
        }
      } catch (err) {
        console.error('Error loading menu:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [restaurantIdParam])

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) {
        return false
      }
      if (vegOnly && !item.isVeg) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesDesc = item.description?.toLowerCase().includes(q)
        if (!matchesName && !matchesDesc) return false
      }
      return true
    })
  }, [items, selectedCategory, vegOnly, searchQuery])

  // Grouped items by category for structured browsing
  const groupedCategories = useMemo(() => {
    if (selectedCategory !== 'ALL') {
      const cat = categories.find((c) => c.id === selectedCategory)
      if (!cat) return []
      const catItems = filteredItems.filter((i) => i.categoryId === cat.id)
      return catItems.length > 0 ? [{ ...cat, filteredItems: catItems }] : []
    }

    return categories
      .map((cat) => ({
        ...cat,
        filteredItems: filteredItems.filter((i) => i.categoryId === cat.id),
      }))
      .filter((cat) => cat.filteredItems.length > 0)
  }, [categories, filteredItems, selectedCategory])

  const getItemCartQuantity = (itemId: string) => {
    const found = cart.items.find((i) => i.menuItemId === itemId)
    return found ? found.quantity : 0
  }

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return
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

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    dispatch(updateQuantity({ menuItemId: itemId, quantity: newQty }))
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '16px', mb: 3 }} />
          <Skeleton variant="rectangular" height={50} sx={{ borderRadius: '8px', mb: 3 }} />
          <Stack spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height={110} sx={{ borderRadius: '12px' }} />
            ))}
          </Stack>
        </Container>
      </Box>
    )
  }

  if (!restaurant) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
          <StorefrontIcon sx={{ fontSize: 64, color: '#f97316', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Restaurant Menu Not Available
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            The requested restaurant is either not registered or currently offline.
          </Typography>
          <Button variant="contained" color="primary" component={Link} href="/">
            Return Home
          </Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA', pb: 12 }}>
      <Navbar />

      <Container maxWidth="md" sx={{ py: { xs: 2.5, sm: 4 } }}>
        {/* Restaurant Header Banner */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            mb: 3,
            position: 'relative',
          }}
        >
          {tableParam && (
            <Chip
              label={`Table ${tableParam}`}
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                fontWeight: 800,
                borderRadius: '6px',
              }}
            />
          )}

          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
            {restaurant.name}
          </Typography>

          <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
            {restaurant.description}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2.5 }} sx={{ color: '#475569', fontSize: '0.85rem' }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocationOnIcon fontSize="small" sx={{ color: '#ea580c' }} />
              <span>{restaurant.address}, {restaurant.city}</span>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTimeIcon fontSize="small" sx={{ color: '#ea580c' }} />
              <span>{restaurant.openingTime} - {restaurant.closingTime}</span>
            </Stack>
          </Stack>
        </Card>

        {/* Filters & Search Subheader */}
        <Box
          sx={{
            position: 'sticky',
            top: 70,
            zIndex: 10,
            bgcolor: '#F8F9FA',
            pt: 1,
            pb: 2,
          }}
        >
          <Card
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  placeholder="Search dishes or ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '8px' },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
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
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: vegOnly ? '#15803d' : '#475569' }}>
                      🌱 Veg Only
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </Grid>
            </Grid>

            {/* Category Tabs */}
            {categories.length > 0 && (
              <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                <Tabs
                  value={selectedCategory}
                  onChange={(_, val) => setSelectedCategory(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 34,
                    '& .MuiTab-root': {
                      minHeight: 34,
                      py: 0.5,
                      px: 1.8,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      borderRadius: '6px',
                      mr: 1,
                    },
                    '& .Mui-selected': {
                      color: '#ea580c !important',
                      bgcolor: '#fff7ed',
                    },
                    '& .MuiTabs-indicator': {
                      display: 'none',
                    },
                  }}
                >
                  <Tab value="ALL" label="All Categories" />
                  {categories.map((c) => (
                    <Tab key={c.id} value={c.id} label={c.name} />
                  ))}
                </Tabs>
              </Box>
            )}
          </Card>
        </Box>

        {/* Menu Listings by Category */}
        <Stack spacing={4} sx={{ mt: 2 }}>
          {groupedCategories.length > 0 ? (
            groupedCategories.map((group) => (
              <Box key={group.id}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                  {group.name}
                  <Typography component="span" sx={{ color: '#94a3b8', fontSize: '0.9rem', ml: 1, fontWeight: 500 }}>
                    ({group.filteredItems.length})
                  </Typography>
                </Typography>

                <Stack spacing={2}>
                  {group.filteredItems.map((item) => {
                    const qty = getItemCartQuantity(item.id)
                    const isAvailable = item.isAvailable ?? true

                    return (
                      <Card
                        key={item.id}
                        elevation={0}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          bgcolor: '#ffffff',
                          display: 'flex',
                          flexDirection: { xs: 'column-reverse', sm: 'row' },
                          justifyContent: 'space-between',
                          gap: 2,
                          opacity: isAvailable ? 1 : 0.6,
                        }}
                      >
                        {/* Left Details */}
                        <Box sx={{ flexGrow: 1 }}>
                          {/* Veg / Non-Veg Icon */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                border: item.isVeg ? '2px solid #16a34a' : '2px solid #dc2626',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1,
                              }}
                            >
                              {item.isVeg ? (
                                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#16a34a' }} />
                              ) : (
                                <Box
                                  sx={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '4px solid transparent',
                                    borderRight: '4px solid transparent',
                                    borderBottom: '7px solid #dc2626',
                                  }}
                                />
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: item.isVeg ? '#15803d' : '#b91c1c' }}>
                              {item.isVeg ? 'Veg' : 'Non-Veg'}
                            </Typography>
                          </Box>

                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                            {item.name}
                          </Typography>

                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#ea580c', fontSize: '1.05rem', mb: 1 }}>
                            ₹{item.price}
                          </Typography>

                          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, mb: 1.5 }}>
                            {item.description}
                          </Typography>

                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                            <AccessTimeIcon sx={{ fontSize: '0.9rem' }} />
                            <span>{item.prepTimeMins || 20} mins prep</span>
                          </Stack>
                        </Box>

                        {/* Right Photo & ADD Stepper */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: { xs: '100%', sm: 130 },
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              height: 110,
                              borderRadius: '10px',
                              overflow: 'hidden',
                              bgcolor: '#f1f5f9',
                              position: 'relative',
                            }}
                          >
                            {item.imageUrl ? (
                              <Box
                                component="img"
                                src={item.imageUrl}
                                alt={item.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: '#fff7ed',
                                  color: '#fdba74',
                                }}
                              >
                                <RestaurantIcon />
                              </Box>
                            )}
                          </Box>

                          {/* Add / Stepper Button */}
                          <Box sx={{ mt: -2, zIndex: 2, width: '85%' }}>
                            {!isAvailable ? (
                              <Chip
                                label="SOLD OUT"
                                size="small"
                                sx={{
                                  width: '100%',
                                  bgcolor: '#f1f5f9',
                                  color: '#94a3b8',
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                  borderRadius: '6px',
                                }}
                              />
                            ) : qty === 0 ? (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                fullWidth
                                onClick={() => handleAddToCart(item)}
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.82rem',
                                  py: 0.6,
                                  borderRadius: '6px',
                                  boxShadow: '0 3px 10px rgba(232, 93, 4, 0.25)',
                                }}
                              >
                                ADD
                              </Button>
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  bgcolor: '#ea580c',
                                  color: '#ffffff',
                                  borderRadius: '6px',
                                  p: '2px 6px',
                                  boxShadow: '0 3px 10px rgba(232, 93, 4, 0.3)',
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleUpdateQuantity(item.id, qty - 1)}
                                  sx={{ color: '#ffffff', p: 0.5 }}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                                  {qty}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleUpdateQuantity(item.id, qty + 1)}
                                  sx={{ color: '#ffffff', p: 0.5 }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Card>
                    )
                  })}
                </Stack>
              </Box>
            ))
          ) : (
            <Card
              elevation={0}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
                bgcolor: '#ffffff',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                No Dishes Match Your Selection
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Try resetting your search query or turning off the Veg Only filter.
              </Typography>
            </Card>
          )}
        </Stack>
      </Container>

      {/* Floating Bottom Cart Bar */}
      {cart.items.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 100,
            px: 2,
          }}
        >
          <Card
            elevation={4}
            sx={{
              maxWidth: 600,
              width: '100%',
              bgcolor: '#1e293b',
              color: '#ffffff',
              borderRadius: '12px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Badge badgeContent={cart.items.reduce((s, i) => s + i.quantity, 0)} color="primary">
                <ShoppingBagIcon sx={{ color: '#ffffff', fontSize: 26 }} />
              </Badge>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                  ₹{cart.subtotal.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  {cart.items.length} unique item{cart.items.length > 1 ? 's' : ''} in cart
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/checkout"
              sx={{
                fontWeight: 800,
                px: 3,
                py: 1,
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(232, 93, 4, 0.4)',
              }}
            >
              View
            </Button>
          </Card>
        </Box>
      )}
    </Box>
  )
}

export default function CustomerMenuPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }} />}>
      <MenuContent />
    </Suspense>
  )
}
