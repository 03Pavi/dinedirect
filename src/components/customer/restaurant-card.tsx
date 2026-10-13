'use client'

import React from 'react'
import { Box, Card, Typography, Chip, Button } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { Restaurant } from '@/types/restaurant-types'

interface RestaurantCardProps {
  restaurant: Restaurant
  onExplore: (restaurant: Restaurant) => void
}

export function RestaurantCard({ restaurant, onExplore }: RestaurantCardProps) {
  const imageSrc =
    restaurant.imageUrl ||
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'

  const cuisinesList = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine
    : typeof restaurant.cuisine === 'string'
      ? JSON.parse(restaurant.cuisine || '[]')
      : []

  return (
    <Card
      elevation={0}
      onClick={() => onExplore(restaurant)}
      sx={{
        borderRadius: '16px',
        border: '1.5px solid #e2e8f0',
        bgcolor: '#ffffff',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: '#ea580c',
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.08)',
          '& .rest-img': {
            transform: 'scale(1.04)',
          },
        },
      }}
    >
      {/* Cover Image */}
      <Box sx={{ position: 'relative', height: 160, overflow: 'hidden', bgcolor: '#f8fafc' }}>
        <Box
          component="img"
          className="rest-img"
          src={imageSrc}
          alt={restaurant.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Status Chip */}
        <Chip
          label={restaurant.isOpen ? 'ONLINE' : 'CLOSED'}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: restaurant.isOpen ? '#22c55e' : '#64748b',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.72rem',
            borderRadius: '6px',
          }}
        />

        {/* Discount Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#fef08a',
            px: 1.2,
            py: 0.4,
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          20% OFF | Use FEAST20
        </Box>
      </Box>

      {/* Card Body */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, lineHeight: 1.3 }}>
          {restaurant.name}
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem', mb: 1.5 }} noWrap>
          {cuisinesList.length > 0 ? cuisinesList.join(', ') : 'Multi-cuisine, Street Food'}
        </Typography>

        {/* Meta details */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            color: '#475569',
            fontSize: '0.8rem',
            fontWeight: 600,
            pt: 1.5,
            borderTop: '1px solid #f1f5f9',
            mt: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: '#ea580c' }} />
            <span>25-35 mins</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DeliveryDiningIcon sx={{ fontSize: 16, color: '#ea580c' }} />
            <span>₹{restaurant.deliveryFee} fee</span>
          </Box>
          <Box sx={{ color: '#0f172a', fontWeight: 700 }}>
            Min ₹{restaurant.minOrder}
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="small"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          sx={{
            mt: 2,
            py: 1,
            borderRadius: '10px',
            bgcolor: '#ea580c',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#c2410c',
            },
          }}
        >
          Explore Menu
        </Button>
      </Box>
    </Card>
  )
}
