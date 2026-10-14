'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  IconButton,
  Badge,
  Button,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import StorefrontIcon from '@mui/icons-material/Storefront'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'

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
  searchQuery?: string
  onSearchChange?: (query: string) => void
  viewMode?: 'restaurants' | 'dishes'
  onViewModeChange?: (mode: 'restaurants' | 'dishes') => void
  onOpenMobileSidebar?: () => void
  onOpenMobileCart?: () => void
  cartItemCount?: number
  /** Dish items (optional) */
  dishes?: SearchDish[]
  /** Restaurant list (optional) */
  restaurants?: Restaurant[]
  /** Called when user clicks a dish result (optional) */
  onSelectDish?: (dish: SearchDish) => void
  /** Called when user clicks a restaurant result (optional) */
  onSelectRestaurant?: (restaurant: Restaurant) => void
}

export function CustomerHeader({
  searchQuery = '',
  onSearchChange,
  viewMode = 'restaurants',
  onViewModeChange,
  onOpenMobileSidebar,
  onOpenMobileCart,
  cartItemCount = 0,
}: CustomerHeaderProps) {
  const router = useRouter()

  const handleSearchClick = () => {
    router.push('/search?focus=true')
  }

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
      {/* Mobile Hamburger for small screens */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={onOpenMobileSidebar}
          sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#0f172a' }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Center Search Bar: Clickable shortcut to Search Page */}
      <Box
        sx={{
          flex: 1,
          maxWidth: { xs: '100%', sm: 460, md: 540 },
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          position: 'relative',
        }}
      >
        <Box
          onClick={handleSearchClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleSearchClick()
            }
          }}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '24px',
            px: 2,
            py: 0.9,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#ea580c',
              bgcolor: '#ffffff',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)',
              '& .search-icon': {
                color: '#ea580c',
              },
            },
            '&:focus-visible': {
              outline: '2px solid #ea580c',
              outlineOffset: 1,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, color: '#94a3b8' }}>
            <SearchIcon className="search-icon" sx={{ fontSize: 20, transition: 'color 0.2s ease' }} />
            <Typography
              variant="body2"
              sx={{
                color: '#94a3b8',
                fontWeight: 500,
                fontSize: '0.9rem',
                userSelect: 'none',
              }}
            >
              What would you like to eat?
            </Typography>
          </Box>
          <TuneIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
        </Box>

        {/* View Mode Switcher Pills */}
        {onViewModeChange && (
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
        )}
      </Box>

      {/* Right Controls: Notifications, Mobile Cart */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        {/* Mobile Cart Button */}
        {onOpenMobileCart && (
          <IconButton
            onClick={onOpenMobileCart}
            sx={{
              display: { xs: 'inline-flex', lg: 'none' },
              color: '#0f172a',
            }}
          >
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingBagOutlinedIcon />
            </Badge>
          </IconButton>
        )}

        {/* Notifications */}
        <IconButton sx={{ color: '#64748b' }}>
          <Badge variant="dot" color="error">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  )
}
