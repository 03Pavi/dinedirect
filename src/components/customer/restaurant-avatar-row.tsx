'use client'

import React from 'react'
import { Box, Typography, Avatar } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { Restaurant } from '@/types/restaurant-types'

export const DEFAULT_POPULAR_BRANDS = [
  {
    id: 'brand-sangeetha',
    name: 'Sangeetha',
    time: '42 mins',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80',
    cuisine: ['South Indian', 'Pure Veg'],
  },
  {
    id: 'brand-thalappakatti',
    name: 'Thalappakatti',
    time: '32 mins',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80',
    cuisine: ['Biryani', 'Mughlai'],
  },
  {
    id: 'brand-subway',
    name: 'Subway',
    time: '26 mins',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=300&q=80',
    cuisine: ['Healthy', 'Subs', 'Salads'],
  },
  {
    id: 'brand-chaikings',
    name: 'Chai Kings',
    time: '38 mins',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80',
    cuisine: ['Beverages', 'Snacks'],
  },
  {
    id: 'brand-bbqnation',
    name: 'BBQ Nation',
    time: '53 mins',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80',
    cuisine: ['Barbecue', 'Buffet'],
  },
  {
    id: 'brand-a2b',
    name: 'A2B Chennai',
    time: '22 mins',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80',
    cuisine: ['South Indian', 'Sweets'],
  },
  {
    id: 'brand-kfc',
    name: 'KFC',
    time: '13 mins',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
    cuisine: ['Fast Food', 'Burgers'],
  },
  {
    id: 'brand-aasife',
    name: 'Aasife Biryani',
    time: '31 mins',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=300&q=80',
    cuisine: ['Biryani', 'Tandoori'],
  },
  {
    id: 'brand-chennai',
    name: 'Chennai Birya',
    time: '44 mins',
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=300&q=80',
    cuisine: ['Biryani', 'Chettinad'],
  },
]

interface RestaurantAvatarRowProps {
  restaurants: Restaurant[]
  selectedRestaurantId?: string | null
  onSelectRestaurant: (restaurant: Restaurant | any) => void
}

export function RestaurantAvatarRow({
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
}: RestaurantAvatarRowProps) {
  // Use real restaurants if available, merged with popular brands
  const brandsToDisplay =
    restaurants.length > 0
      ? [
          ...restaurants.map((r, i) => ({
            id: r.id,
            name: r.name,
            time: '25-35 mins',
            imageUrl: r.imageUrl || DEFAULT_POPULAR_BRANDS[i % DEFAULT_POPULAR_BRANDS.length].imageUrl,
            rawRestaurant: r,
          })),
          ...DEFAULT_POPULAR_BRANDS.filter((d) => !restaurants.some((r) => r.name.toLowerCase() === d.name.toLowerCase())),
        ]
      : DEFAULT_POPULAR_BRANDS

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
        {brandsToDisplay.map((brand: any) => {
          const isSelected = selectedRestaurantId === brand.id

          return (
            <Box
              key={brand.id}
              onClick={() => onSelectRestaurant(brand.rawRestaurant || brand)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: 78,
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
                src={brand.imageUrl}
                alt={brand.name}
                sx={{
                  width: 66,
                  height: 66,
                  mb: 0.8,
                  border: isSelected ? '3px solid #ea580c' : '2px solid #f1f5f9',
                  boxShadow: isSelected ? '0 8px 16px -4px rgba(234, 88, 12, 0.4)' : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  bgcolor: '#fff7ed',
                  color: '#ea580c',
                }}
              >
                <StorefrontIcon />
              </Avatar>

              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: isSelected ? '#ea580c' : '#0f172a',
                  maxWidth: 78,
                  lineHeight: 1.2,
                  mb: 0.2,
                }}
              >
                {brand.name}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600 }}>
                {brand.time || '25 mins'}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
