'use client'

import React from 'react'
import {
  Card,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, updateQuantity } from '@/store/slices/cart-slice'
import { MenuItem } from '@/types/menu-types'

interface CustomerDishCardProps {
  item: MenuItem
  restaurantId?: string
  restaurantName?: string
  promoTag?: string
}

export function CustomerDishCard({
  item,
  restaurantId = 'rest-default',
  restaurantName = 'DineIn Kitchen',
  promoTag,
}: CustomerDishCardProps) {
  const dispatch = useAppDispatch()
  const cart = useAppSelector((state) => state.cart)

  const cartItem = cart.items.find((i) => i.menuItemId === item.id)
  const quantity = cartItem ? cartItem.quantity : 0
  const isAvailable = item.isAvailable ?? true

  const handleAdd = () => {
    dispatch(
      addItem({
        restaurantId,
        restaurantName,
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

  const handleQtyChange = (newQty: number) => {
    dispatch(updateQuantity({ menuItemId: item.id, quantity: newQty }))
  }

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 1.8, sm: 2 },
        borderRadius: '14px',
        border: '1.5px solid #f1f5f9',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', sm: 'center' },
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#ea580c',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Square Food Photo on Left */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: '100%', sm: 110 },
          height: { xs: 140, sm: 110 },
          borderRadius: '12px',
          overflow: 'hidden',
          bgcolor: '#f8fafc',
          flexShrink: 0,
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
              color: '#ea580c',
            }}
          >
            <RestaurantIcon sx={{ fontSize: 36 }} />
          </Box>
        )}

        {/* Veg / Non-Veg Indicator Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: '#ffffff',
            borderRadius: '4px',
            p: '2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.isVeg ? (
            <Box
              sx={{
                width: 14,
                height: 14,
                border: '2px solid #16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16a34a' }} />
            </Box>
          ) : (
            <Box
              sx={{
                width: 14,
                height: 14,
                border: '2px solid #dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: '3px solid transparent',
                  borderRight: '3px solid transparent',
                  borderBottom: '6px solid #dc2626',
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Center Details */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            fontSize: '1rem',
            lineHeight: 1.3,
            mb: 0.3,
          }}
        >
          {item.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontSize: '0.82rem',
            lineHeight: 1.4,
            mb: 0.8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </Typography>

        {/* Promo tag (e.g. 20 $ off | Use JUMBO) */}
        {promoTag ? (
          <Typography
            variant="caption"
            sx={{
              color: '#ea580c',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'block',
              mb: 0.5,
            }}
          >
            {promoTag}
          </Typography>
        ) : (
          <Typography
            variant="caption"
            sx={{
              color: '#16a34a',
              fontWeight: 700,
              fontSize: '0.75rem',
              display: 'block',
              mb: 0.5,
            }}
          >
            ★ 4.4 | {item.prepTimeMins || 20} mins prep
          </Typography>
        )}

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}
          >
            Rs {item.price}
          </Typography>
        </Stack>
      </Box>

      {/* Right Action: ADD / Quantity Stepper */}
      <Box sx={{ flexShrink: 0, textAlign: { xs: 'left', sm: 'right' } }}>
        {!isAvailable ? (
          <Chip
            label="Sold Out"
            size="small"
            sx={{
              bgcolor: '#f1f5f9',
              color: '#94a3b8',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        ) : quantity === 0 ? (
          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{
              bgcolor: '#ea580c',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.82rem',
              py: 0.7,
              px: 2.5,
              borderRadius: '8px',
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#c2410c',
              },
            }}
          >
            ADD
          </Button>
        ) : (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              bgcolor: '#ea580c',
              color: '#ffffff',
              borderRadius: '8px',
              p: '2px 8px',
              boxShadow: '0 3px 10px rgba(232, 93, 4, 0.25)',
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleQtyChange(quantity - 1)}
              sx={{ color: '#ffffff', p: 0.4 }}
            >
              <RemoveIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', mx: 1 }}>
              {quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleQtyChange(quantity + 1)}
              sx={{ color: '#ffffff', p: 0.4 }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Card>
  )
}
