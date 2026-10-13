'use client'

import React from 'react'
import { Box, Typography, Avatar } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { Restaurant } from '@/types/restaurant-types'

interface RestaurantAvatarRowProps {
  restaurants: Restaurant[]
  selectedRestaurantId?: string | null
  onSelectRestaurant: (restaurant: Restaurant) => void
}

export function RestaurantAvatarRow({
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
}: RestaurantAvatarRowProps) {
  // Only display actual registered restaurants from database
  if (!restaurants || restaurants.length === 0) {
    return null
  }

  return (
    <Box sx={{ my: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
          Popular Brands
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
          Most ordered from around your locality
        </Typography>
      </Box>

      {/* Horizontal Scroll Row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2.2,
          overflowX: 'auto',
          pb: 1.5,
          pt: 0.5,
          '::-webkit-scrollbar': { height: 4 },
          '::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 4 },
        }}
      >
        {restaurants.map((restaurant) => {
          const isSelected = selectedRestaurantId === restaurant.id
          const fallbackInitial = restaurant.name ? restaurant.name.charAt(0).toUpperCase() : 'R'

          return (
            <Box
              key={restaurant.id}
              onClick={() => onSelectRestaurant(restaurant)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: 80,
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  '& .brand-avatar': {
                    borderColor: '#ea580c',
                    boxShadow: '0 8px 16px -4px rgba(234, 88, 12, 0.35)',
                  },
                },
              }}
            >
              <Avatar
                className="brand-avatar"
                src={restaurant.imageUrl || undefined}
                alt={restaurant.name}
                sx={{
                  width: 66,
                  height: 66,
                  mb: 0.8,
                  border: isSelected ? '3px solid #ea580c' : '2px solid #f1f5f9',
                  boxShadow: isSelected ? '0 8px 16px -4px rgba(234, 88, 12, 0.4)' : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  bgcolor: '#fff7ed',
                  color: '#ea580c',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                }}
              >
                {restaurant.imageUrl ? <StorefrontIcon /> : fallbackInitial}
              </Avatar>

              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: isSelected ? '#ea580c' : '#0f172a',
                  maxWidth: 80,
                  lineHeight: 1.2,
                  mb: 0.2,
                }}
              >
                {restaurant.name}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600 }}>
                {restaurant.city || '25-30 mins'}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
