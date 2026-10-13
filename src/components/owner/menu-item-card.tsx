'use client'

import React from 'react'
import {
  Card,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import { MenuItem as MenuItemType } from '@/types/menu-types'

interface MenuItemCardProps {
  item: MenuItemType
  categoryName?: string
  onEdit: (item: MenuItemType) => void
  onDelete: (item: MenuItemType) => void
  onToggleAvailability: (item: MenuItemType) => void
  isToggling?: boolean
}

export function MenuItemCard({
  item,
  categoryName,
  onEdit,
  onDelete,
  onToggleAvailability,
  isToggling = false,
}: MenuItemCardProps) {
  const isAvailable = item.isAvailable ?? true

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: '1px solid',
        borderColor: isAvailable ? '#e2e8f0' : '#cbd5e1',
        overflow: 'hidden',
        bgcolor: '#ffffff',
        opacity: isAvailable ? 1 : 0.72,
        transition: 'all 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          borderColor: isAvailable ? '#ea580c' : '#94a3b8',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Image & Badges Banner */}
      <Box sx={{ position: 'relative', width: '100%', height: 160, bgcolor: '#f1f5f9' }}>
        {item.imageUrl ? (
          <Box
            component="img"
            src={item.imageUrl}
            alt={item.name}
            onError={(e) => {
              // Hide broken image
              e.currentTarget.style.display = 'none'
            }}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
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
              color: '#fdba74',
            }}
          >
            <RestaurantIcon sx={{ fontSize: 48 }} />
          </Box>
        )}

        {/* Veg / Non-Veg Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            bgcolor: '#ffffff',
            borderRadius: '4px',
            p: '3px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.isVeg ? (
            <Box
              sx={{
                width: 16,
                height: 16,
                border: '2px solid #16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#16a34a' }} />
            </Box>
          ) : (
            <Box
              sx={{
                width: 16,
                height: 16,
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
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: '7px solid #dc2626',
                }}
              />
            </Box>
          )}
        </Box>

        {/* Out of Stock Ribbon */}
        {!isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              px: 1,
              py: 0.4,
              borderRadius: '4px',
              letterSpacing: '0.05em',
            }}
          >
            OUT OF STOCK
          </Box>
        )}

        {/* Category Chip */}
        {categoryName && (
          <Chip
            label={categoryName}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              fontWeight: 700,
              fontSize: '0.72rem',
              color: '#1e293b',
              borderRadius: '4px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
            }}
          />
        )}
      </Box>

      {/* Content Details */}
      <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 0.5 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.3,
              fontSize: '1rem',
            }}
          >
            {item.name}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#ea580c',
              fontSize: '1.05rem',
              whiteSpace: 'nowrap',
            }}
          >
            ₹{item.price}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontSize: '0.82rem',
            lineHeight: 1.45,
            mb: 1.5,
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
            <AccessTimeIcon sx={{ fontSize: '0.9rem', color: '#94a3b8' }} />
            <span>{item.prepTimeMins || 20} mins prep</span>
          </Stack>
        </Stack>

        {/* Footer with Controls */}
        <Box
          sx={{
            pt: 1.5,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Quick Availability Toggle */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={isAvailable}
                onChange={() => onToggleAvailability(item)}
                disabled={isToggling}
                color="success"
              />
            }
            label={
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isAvailable ? '#15803d' : '#94a3b8' }}>
                {isAvailable ? 'In Stock' : 'Out of Stock'}
              </Typography>
            }
            sx={{ m: 0 }}
          />

          {/* Action Buttons */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit item">
              <IconButton
                size="small"
                onClick={() => onEdit(item)}
                sx={{
                  color: '#475569',
                  '&:hover': { color: '#ea580c', bgcolor: '#fff7ed' },
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete item">
              <IconButton
                size="small"
                onClick={() => onDelete(item)}
                sx={{
                  color: '#94a3b8',
                  '&:hover': { color: '#dc2626', bgcolor: '#fef2f2' },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Card>
  )
}
