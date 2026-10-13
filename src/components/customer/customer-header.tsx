'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Box,
  IconButton,
  Badge,
  Button,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import StorefrontIcon from '@mui/icons-material/Storefront'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'

import { SearchAutocomplete } from '@/components/customer/search-autocomplete'
import { Restaurant } from '@/types/restaurant-types'

interface SearchDish {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string | null
  isVeg?: boolean
  brandName?: string
  promoTag?: string
}

interface CustomerHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: 'restaurants' | 'dishes'
  onViewModeChange: (mode: 'restaurants' | 'dishes') => void
  onOpenMobileSidebar: () => void
  onOpenMobileCart: () => void
  cartItemCount: number
  /** Dish items to suggest in the autocomplete dropdown */
  dishes?: SearchDish[]
  /** Restaurant list to suggest in the autocomplete dropdown */
  restaurants?: Restaurant[]
  /** Called when user clicks a dish result */
  onSelectDish?: (dish: SearchDish) => void
  /** Called when user clicks a restaurant result */
  onSelectRestaurant?: (restaurant: Restaurant) => void
}

export function CustomerHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenMobileSidebar,
  onOpenMobileCart,
  cartItemCount,
  dishes = [],
  restaurants = [],
  onSelectDish,
  onSelectRestaurant,
}: CustomerHeaderProps) {
  const [autocompleteOpen, setAutocompleteOpen] = useState(false)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 2,
        px: { xs: 2, sm: 3 },
        bgcolor: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Mobile Hamburger & Logo for small screens */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={onOpenMobileSidebar}
          sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#0f172a' }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Center Search Bar + Autocomplete */}
      <Box
        sx={{
          flex: 1,
          maxWidth: { xs: '100%', sm: 460, md: 540 },
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          position: 'relative',
          zIndex: autocompleteOpen ? 1200 : 10,
        }}
      >
        <SearchAutocomplete
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          open={autocompleteOpen}
          onOpenChange={setAutocompleteOpen}
          dishes={dishes}
          restaurants={restaurants}
          onSelectDish={onSelectDish}
          onSelectRestaurant={onSelectRestaurant}
        />

        {/* View Mode Switcher Pills */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            bgcolor: '#f1f5f9',
            p: 0.4,
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <Button
            size="small"
            onClick={() => onViewModeChange('restaurants')}
            startIcon={<StorefrontIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '20px',
              px: 1.8,
              py: 0.5,
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: viewMode === 'restaurants' ? '#ffffff' : 'transparent',
              color: viewMode === 'restaurants' ? '#ea580c' : '#64748b',
              boxShadow: viewMode === 'restaurants' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              '&:hover': {
                bgcolor: viewMode === 'restaurants' ? '#ffffff' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            Restaurants
          </Button>
          <Button
            size="small"
            onClick={() => onViewModeChange('dishes')}
            startIcon={<RestaurantMenuIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '20px',
              px: 1.8,
              py: 0.5,
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: viewMode === 'dishes' ? '#ffffff' : 'transparent',
              color: viewMode === 'dishes' ? '#ea580c' : '#64748b',
              boxShadow: viewMode === 'dishes' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              '&:hover': {
                bgcolor: viewMode === 'dishes' ? '#ffffff' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            Dishes
          </Button>
        </Box>
      </Box>

      {/* Right Controls: Notifications, Mobile Cart */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        {/* Mobile Cart Button */}
        <IconButton
          onClick={onOpenMobileCart}
          sx={{
            display: { xs: 'inline-flex', lg: 'none' },
            bgcolor: '#fff7ed',
            color: '#ea580c',
            border: '1px solid #ffedd5',
          }}
        >
          <Badge badgeContent={cartItemCount} color="error">
            <ShoppingBagOutlinedIcon fontSize="small" />
          </Badge>
        </IconButton>

        {/* Notifications */}
        <IconButton sx={{ bgcolor: '#f8fafc', color: '#64748b' }} size="small">
          <NotificationsNoneIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  )
}
