'use client'

import React from 'react'
import {
  Box,
  Card,
  Typography,
  Chip,
  Button,
  IconButton,
  Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { MenuItem } from '@/types/menu-types'
import { Restaurant } from '@/types/restaurant-types'

export interface ExtendedMenuItem extends MenuItem {
  category?: {
    id: string
    name: string
    restaurantId: string
    restaurant?: Restaurant
  }
}

interface DishCardProps {
  item: ExtendedMenuItem
  quantityInCart: number
  onAddToCart: (item: ExtendedMenuItem) => void
  onUpdateQuantity: (menuItemId: string, newQty: number) => void
  onSelectRestaurant?: (restaurant: Restaurant) => void
  disabled?: boolean
  disabledReason?: string
}

export function DishCard({
  item,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  onSelectRestaurant,
  disabled,
  disabledReason,
}: DishCardProps) {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80',
  ]
  const imageSrc =
    item.imageUrl ||
    fallbackImages[Math.abs(item.name.charCodeAt(0) || 0) % fallbackImages.length]

  const restaurant = item.category?.restaurant
  const isRestaurantClosed = restaurant?.isOpen === false
  const isItemUnavailable = item.isAvailable === false
  const isDisabled = Boolean(disabled || isRestaurantClosed || isItemUnavailable)

  const badgeLabel =
    disabledReason ||
    (isRestaurantClosed ? 'STORE CLOSED' : isItemUnavailable ? 'OUT OF STOCK' : 'UNAVAILABLE')
  const buttonLabel = isRestaurantClosed
    ? 'Closed'
    : isItemUnavailable
      ? 'Out of Stock'
      : 'Unavailable'

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1.5px solid #e2e8f0',
        bgcolor: isDisabled ? '#f8fafc' : '#ffffff',
        opacity: isDisabled ? 0.78 : 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        ...(!isDisabled && {
          '&:hover': {
            borderColor: '#ea580c',
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.07)',
            '& .dish-img': {
              transform: 'scale(1.05)',
            },
          },
        }),
      }}
    >
      {/* Dish Image Header */}
      <Box sx={{ position: 'relative', height: 160, overflow: 'hidden', bgcolor: '#f8fafc' }}>
        <Box
          component="img"
          className="dish-img"
          src={imageSrc}
          alt={item.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isDisabled ? 'grayscale(0.7)' : 'none',
            transition: 'transform 0.3s ease, filter 0.3s ease',
          }}
        />

        {/* Disabled Overlay Badge */}
        {isDisabled && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(1px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              p: 1,
            }}
          >
            <Chip
              label={badgeLabel}
              size="small"
              sx={{
                bgcolor: isRestaurantClosed ? '#e11d48' : '#475569',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            />
          </Box>
        )}

        {/* Veg / Non-Veg Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: 20,
            height: 20,
            borderRadius: '4px',
            border: `2px solid ${item.isVeg ? '#16a34a' : '#dc2626'}`,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 4,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: item.isVeg ? '#16a34a' : '#dc2626',
            }}
          />
        </Box>

        {/* Prep time chip */}
        {item.prepTimeMins ? (
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              bgcolor: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              px: 1,
              py: 0.3,
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 13 }} />
            {item.prepTimeMins} mins
          </Box>
        ) : null}
      </Box>

      {/* Dish Info Content */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <Box>
          {/* Restaurant chip if present */}
          {restaurant && (
            <Box
              onClick={() => onSelectRestaurant?.(restaurant)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                mb: 1,
                px: 1,
                py: 0.3,
                bgcolor: '#fff7ed',
                color: '#ea580c',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: onSelectRestaurant ? 'pointer' : 'default',
                '&:hover': onSelectRestaurant
                  ? { bgcolor: '#ffedd5', textDecoration: 'underline' }
                  : {},
              }}
            >
              <StorefrontIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {restaurant.name}
              </Typography>
            </Box>
          )}

          {/* Dish Name */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.3,
              mb: 0.5,
            }}
          >
            {item.name}
          </Typography>

          {/* Description */}
          {item.description && (
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontSize: '0.82rem',
                lineHeight: 1.4,
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.description}
            </Typography>
          )}
        </Box>

        {/* Price & Quantity Controls */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
              Price
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              ₹{item.price}
            </Typography>
          </Box>

          {/* Stepper, Add button, or Disabled state */}
          {isDisabled ? (
            <Button
              variant="outlined"
              size="small"
              disabled
              sx={{
                bgcolor: '#f1f5f9',
                color: '#94a3b8 !important',
                borderColor: '#e2e8f0 !important',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '20px',
                px: 2,
                py: 0.6,
                fontSize: '0.78rem',
                cursor: 'not-allowed',
              }}
            >
              {buttonLabel}
            </Button>
          ) : quantityInCart > 0 ? (
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                bgcolor: '#ea580c',
                borderRadius: '24px',
                px: 0.6,
                py: 0.3,
                boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)',
              }}
            >
              <IconButton
                size="small"
                onClick={() => onUpdateQuantity(item.id, quantityInCart - 1)}
                sx={{ color: '#ffffff', p: 0.5 }}
              >
                <RemoveIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  minWidth: 24,
                  textAlign: 'center',
                }}
              >
                {quantityInCart}
              </Typography>
              <IconButton
                size="small"
                onClick={() => onUpdateQuantity(item.id, quantityInCart + 1)}
                sx={{ color: '#ffffff', p: 0.5 }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={() => onAddToCart(item)}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#ea580c',
                color: '#ffffff',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '20px',
                px: 2,
                py: 0.7,
                boxShadow: '0 4px 10px rgba(234, 88, 12, 0.25)',
                '&:hover': {
                  bgcolor: '#c2410c',
                  boxShadow: '0 6px 14px rgba(234, 88, 12, 0.35)',
                },
              }}
            >
              ADD
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  )
}
