'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
import { Restaurant } from '@/types/restaurant-types'
import { MenuCategory, MenuItem } from '@/types/menu-types'
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
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [vegOnly, setVegOnly] = useState(false)

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true)
      try {
        const [catRes, itemRes] = await Promise.all([
          apiClient.get<{ categories: MenuCategory[] }>(
            `/api/menu/categories?restaurantId=${restaurant.id}`
          ),
          apiClient.get<{ items: ExtendedMenuItem[] }>(
            `/api/menu/items?restaurantId=${restaurant.id}`
          ),
        ])
        setCategories(catRes.categories || [])
        setItems(itemRes.items || [])
      } catch (err) {
        console.error('Failed to load restaurant menu:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [restaurant.id])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) {
        return false
      }
      if (vegOnly && !item.isVeg) {
        return false
      }
      return true
    })
  }, [items, selectedCategory, vegOnly])

  const handleAddToCart = (item: ExtendedMenuItem) => {
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
          <Tab label={`All Items (${items.length})`} value="ALL" />
          {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length
            return <Tab key={cat.id} label={`${cat.name} (${count})`} value={cat.id} />
          })}
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

      {/* Items Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#ea580c' }} />
        </Box>
      ) : filteredItems.length === 0 ? (
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          {filteredItems.map((item) => {
            const inCartItem = cart.items.find((i) => i.menuItemId === item.id)
            const qty = inCartItem ? inCartItem.quantity : 0

            return (
              <DishCard
                key={item.id}
                item={item}
                quantityInCart={qty}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
              />
            )
          })}
        </Box>
      )}
    </Box>
  )
}
