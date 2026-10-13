'use client'

import React, { useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  InputAdornment,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Divider,
  Paper,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import CloseIcon from '@mui/icons-material/Close'
import StorefrontIcon from '@mui/icons-material/Storefront'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
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

interface SearchAutocompleteProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onSubmitSearch?: (query: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  dishes: SearchDish[]
  restaurants: Restaurant[]
  onSelectDish?: (dish: SearchDish) => void
  onSelectRestaurant?: (restaurant: Restaurant) => void
}

const MAX_DISHES = 5
const MAX_RESTAURANTS = 3

export function SearchAutocomplete({
  searchQuery,
  onSearchChange,
  onSubmitSearch,
  open,
  onOpenChange,
  dishes,
  restaurants,
  onSelectDish,
  onSelectRestaurant,
}: SearchAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onOpenChange])

  const q = searchQuery.trim().toLowerCase()

  const matchedDishes = q.length < 1
    ? []
    : dishes
        .filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q) ||
            d.brandName?.toLowerCase().includes(q)
        )
        .slice(0, MAX_DISHES)

  const matchedRestaurants = q.length < 1
    ? []
    : restaurants
        .filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.description?.toLowerCase().includes(q) ||
            (Array.isArray(r.cuisine) && r.cuisine.some((c) => c.toLowerCase().includes(q)))
        )
        .slice(0, MAX_RESTAURANTS)

  const hasResults = matchedDishes.length > 0 || matchedRestaurants.length > 0
  const showDropdown = open && q.length > 0

  const handleClear = () => {
    onSearchChange('')
    onSubmitSearch?.('')
    inputRef.current?.focus()
  }

  const handleDishClick = (dish: SearchDish) => {
    onSearchChange(dish.name)
    onOpenChange(false)
    onSubmitSearch?.(dish.name)
    onSelectDish?.(dish)
  }

  const handleRestaurantClick = (restaurant: Restaurant) => {
    onSearchChange(restaurant.name)
    onOpenChange(false)
    onSubmitSearch?.(restaurant.name)
    onSelectRestaurant?.(restaurant)
  }

  // Highlight matching text
  function highlight(text: string): React.ReactNode {
    if (!q) return text
    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <Box
          component="span"
          sx={{
            color: '#ea580c',
            fontWeight: 800,
            bgcolor: '#fff7ed',
            borderRadius: '2px',
            px: 0.3,
          }}
        >
          {text.slice(idx, idx + q.length)}
        </Box>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      {/* Search Input */}
      <TextField
        fullWidth
        size="small"
        placeholder="What would you like to eat?"
        value={searchQuery}
        inputRef={inputRef}
        autoComplete="off"
        onChange={(e) => {
          onSearchChange(e.target.value)
          onOpenChange(true)
        }}
        onFocus={() => onOpenChange(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onOpenChange(false)
          if (e.key === 'Enter') {
            onOpenChange(false)
            onSubmitSearch?.(searchQuery)
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                size="small"
                onClick={() => {
                  onOpenChange(false)
                  onSubmitSearch?.(searchQuery)
                }}
                sx={{ p: 0.2, color: searchQuery ? '#ea580c' : '#94a3b8' }}
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {searchQuery ? (
                <IconButton size="small" onClick={handleClear} sx={{ color: '#94a3b8' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton size="small" sx={{ color: '#94a3b8' }}>
                  <TuneIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
          sx: {
            bgcolor: open && q ? '#ffffff' : '#f8fafc',
            borderRadius: showDropdown ? '12px 12px 0 0' : '24px',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'border-radius 0.15s ease, background 0.15s ease',
            '& fieldset': {
              borderColor: showDropdown ? '#ea580c' : '#e2e8f0',
              borderBottomColor: showDropdown ? 'transparent' : undefined,
              borderWidth: showDropdown ? '1.5px' : '1px',
            },
            '&:hover fieldset': { borderColor: '#ea580c !important' },
            '&.Mui-focused fieldset': {
              borderColor: '#ea580c !important',
              borderWidth: '1.5px',
              borderBottomColor: showDropdown ? 'transparent !important' : undefined,
            },
          },
        }}
      />

      {/* Dropdown */}
      {showDropdown && (
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 9999,
            borderRadius: '0 0 16px 16px',
            border: '1.5px solid #ea580c',
            borderTop: 'none',
            boxShadow: '0 24px 64px rgba(0,0,0,0.13), 0 8px 24px rgba(234,88,12,0.06)',
            overflow: 'hidden',
            maxHeight: 480,
            overflowY: 'auto',
            '::-webkit-scrollbar': { width: 4 },
            '::-webkit-scrollbar-thumb': { bgcolor: '#f1f5f9', borderRadius: '4px' },
          }}
        >
          {!hasResults ? (
            /* Empty state */
            <Box sx={{ p: 3.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2.4rem', mb: 1 }}>🍽️</Typography>
              <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', mb: 0.5 }}>
                No results for &ldquo;{searchQuery}&rdquo;
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Try a different dish, brand, or cuisine type
              </Typography>
            </Box>
          ) : (
            <>
              {/* ── DISHES ── */}
              {matchedDishes.length > 0 && (
                <>
                  {/* Section header */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <WhatshotIcon sx={{ fontSize: 14, color: '#ea580c' }} />
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#64748b',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        flex: 1,
                      }}
                    >
                      Dishes
                    </Typography>
                    <Chip
                      label={`${matchedDishes.length} found`}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        bgcolor: '#fff7ed',
                        color: '#ea580c',
                        '& .MuiChip-label': { px: 0.8 },
                      }}
                    />
                  </Box>

                  {matchedDishes.map((dish, idx) => (
                    <Box
                      key={dish.id}
                      onClick={() => handleDishClick(dish)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.2,
                        cursor: 'pointer',
                        bgcolor: '#ffffff',
                        borderBottom:
                          idx < matchedDishes.length - 1 ? '1px solid #f8fafc' : 'none',
                        transition: 'background 0.12s ease',
                        '&:hover': {
                          bgcolor: '#fff7ed',
                        },
                        '&:active': { bgcolor: '#ffedd5' },
                      }}
                    >
                      {/* Thumbnail */}
                      <Avatar
                        src={dish.imageUrl || undefined}
                        variant="rounded"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '10px',
                          flexShrink: 0,
                          bgcolor: '#f1f5f9',
                          fontSize: '1.4rem',
                        }}
                      >
                        🍴
                      </Avatar>

                      {/* Text info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
                          {/* Veg / Non-veg dot */}
                          <Box
                            sx={{
                              width: 13,
                              height: 13,
                              borderRadius: '2px',
                              border: `1.5px solid ${dish.isVeg ? '#16a34a' : '#dc2626'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: dish.isVeg ? '#16a34a' : '#dc2626',
                              }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              color: '#0f172a',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {highlight(dish.name)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                          {dish.brandName && (
                            <Typography sx={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
                              {dish.brandName}
                            </Typography>
                          )}
                          {dish.promoTag && (
                            <>
                              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#e2e8f0' }} />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                <LocalOfferIcon sx={{ fontSize: 10, color: '#ea580c' }} />
                                <Typography sx={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 700 }}>
                                  {dish.promoTag}
                                </Typography>
                              </Box>
                            </>
                          )}
                        </Box>
                      </Box>

                      {/* Price */}
                      <Typography
                        sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', flexShrink: 0 }}
                      >
                        ₹{dish.price}
                      </Typography>
                    </Box>
                  ))}
                </>
              )}

              {/* ── RESTAURANTS ── */}
              {matchedRestaurants.length > 0 && (
                <>
                  {matchedDishes.length > 0 && <Divider sx={{ borderColor: '#f1f5f9' }} />}

                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <StorefrontIcon sx={{ fontSize: 14, color: '#0ea5e9' }} />
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#64748b',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        flex: 1,
                      }}
                    >
                      Restaurants
                    </Typography>
                    <Chip
                      label={`${matchedRestaurants.length} found`}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        bgcolor: '#f0f9ff',
                        color: '#0ea5e9',
                        '& .MuiChip-label': { px: 0.8 },
                      }}
                    />
                  </Box>

                  {matchedRestaurants.map((restaurant, idx) => (
                    <Box
                      key={restaurant.id}
                      onClick={() => handleRestaurantClick(restaurant)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.2,
                        cursor: 'pointer',
                        bgcolor: '#ffffff',
                        borderBottom:
                          idx < matchedRestaurants.length - 1 ? '1px solid #f8fafc' : 'none',
                        transition: 'background 0.12s ease',
                        '&:hover': { bgcolor: '#f0f9ff' },
                        '&:active': { bgcolor: '#e0f2fe' },
                      }}
                    >
                      {/* Logo */}
                      <Avatar
                        src={restaurant.imageUrl || undefined}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: '#f1f5f9',
                          borderRadius: '10px',
                          flexShrink: 0,
                          fontSize: '1.2rem',
                        }}
                        variant="rounded"
                      >
                        🍽️
                      </Avatar>

                      {/* Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                          {highlight(restaurant.name)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.74rem',
                            color: '#94a3b8',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {Array.isArray(restaurant.cuisine)
                            ? restaurant.cuisine.join(' · ')
                            : restaurant.description?.slice(0, 55) || 'Restaurant'}
                        </Typography>
                      </Box>

                      {/* Open badge */}
                      <Chip
                        label="Open"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: '#dcfce7',
                          color: '#15803d',
                          flexShrink: 0,
                          '& .MuiChip-label': { px: 0.8 },
                        }}
                      />
                    </Box>
                  ))}
                </>
              )}

              {/* Footer hint */}
              <Box
                sx={{
                  px: 2,
                  py: 0.9,
                  bgcolor: '#fafafa',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.71rem', color: '#94a3b8', fontWeight: 600 }}>
                  Press{' '}
                  <Box
                    component="kbd"
                    sx={{
                      bgcolor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      px: 0.7,
                      py: 0.15,
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      mx: 0.4,
                    }}
                  >
                    Enter
                  </Box>{' '}
                  to see all results ·{' '}
                  <Box
                    component="kbd"
                    sx={{
                      bgcolor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      px: 0.7,
                      py: 0.15,
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      mx: 0.4,
                    }}
                  >
                    Esc
                  </Box>{' '}
                  to close
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      )}
    </Box>
  )
}
