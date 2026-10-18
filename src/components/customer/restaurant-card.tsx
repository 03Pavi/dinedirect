'use client'

import React from 'react'
import { Box, Card, Typography, Button } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Restaurant } from '@/types/restaurant-types'

interface RestaurantCardProps {
  restaurant: Restaurant
  onExplore: (restaurant: Restaurant) => void
}

export function RestaurantCard({ restaurant, onExplore }: RestaurantCardProps) {
  const imageSrc =
    restaurant.imageUrl ||
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'

  let cuisinesList: string[] = []
  if (Array.isArray(restaurant.cuisine)) {
    cuisinesList = restaurant.cuisine
  } else if (typeof restaurant.cuisine === 'string') {
    try {
      const parsed = JSON.parse(restaurant.cuisine)
      cuisinesList = Array.isArray(parsed) ? parsed : [restaurant.cuisine]
    } catch {
      cuisinesList = restaurant.cuisine ? [restaurant.cuisine] : []
    }
  }

  const cuisineText = cuisinesList.length > 0 ? cuisinesList.join(', ') : 'North Indian'
  const deliveryFee =
    restaurant.deliveryFee !== undefined && restaurant.deliveryFee !== null ? restaurant.deliveryFee : 30
  const minOrder =
    restaurant.minOrder !== undefined && restaurant.minOrder !== null ? restaurant.minOrder : 100

  return (
    <Card
      elevation={0}
      onClick={() => onExplore(restaurant)}
      sx={{
        borderRadius: '20px',
        border: '1.5px solid #e2e8f0',
        bgcolor: '#ffffff',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: '#ea580c',
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 32px -8px rgba(234, 88, 12, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
          '& .rest-img': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      {/* Cover Image & Badges */}
      <Box sx={{ position: 'relative', height: 165, overflow: 'hidden', bgcolor: '#f8fafc' }}>
        <Box
          component="img"
          className="rest-img"
          src={imageSrc}
          alt={restaurant.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.35s ease',
          }}
        />

        {/* Top-Right Status Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: restaurant.isOpen ? '#16a34a' : '#475569',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.72rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            px: 1.2,
            py: 0.35,
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          {restaurant.isOpen ? 'ONLINE' : 'CLOSED'}
        </Box>

        {/* Bottom-Left Discount Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            bgcolor: '#1e293b',
            color: '#fde047',
            px: 1.2,
            py: 0.35,
            borderRadius: '6px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.01em',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
          }}
        >
          20% OFF | Use FEAST20
        </Box>
      </Box>

      {/* Card Content */}
      <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
            mb: 0.5,
          }}
          noWrap
        >
          {restaurant.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontSize: '0.875rem',
            fontWeight: 500,
            mb: 1.8,
          }}
          noWrap
        >
          {cuisineText}
        </Typography>

        {/* Divider */}
        <Box sx={{ borderTop: '1px solid #f1f5f9', width: '100%', mb: 1.8, mt: 'auto' }} />

        {/* Meta Stats Row (Aligned Left, Center, Right) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            fontSize: '0.82rem',
            mb: { xs: 0, md: 2 },
          }}
        >
          {/* 1. Delivery Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#334155', fontWeight: 600 }}>
            <AccessTimeIcon sx={{ fontSize: 17, color: '#ea580c' }} />
            <span>25-35 mins</span>
          </Box>

          {/* 2. Delivery Fee */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#334155', fontWeight: 600 }}>
            <TwoWheelerIcon sx={{ fontSize: 18, color: '#ea580c' }} />
            <span>₹{deliveryFee} fee</span>
          </Box>

          {/* 3. Min Order */}
          <Box sx={{ color: '#0f172a', fontWeight: 700 }}>
            Min ₹{minOrder}
          </Box>
        </Box>

        {/* Explore Menu Button (Visible on Desktop only) */}
        <Button
          fullWidth
          variant="contained"
          onClick={(e) => {
            e.stopPropagation()
            onExplore(restaurant)
          }}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
          sx={{
            display: { xs: 'none', md: 'flex' },
            py: 1.2,
            borderRadius: '12px',
            bgcolor: '#ea580c',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.92rem',
            boxShadow: 'none',
            color: '#ffffff',
            '&:hover': {
              bgcolor: '#c2410c',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
            },
          }}
        >
          Explore Menu
        </Button>
      </Box>
    </Card>
  )
}
