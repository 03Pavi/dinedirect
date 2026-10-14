'use client'

import React from 'react'
import {
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
} from '@mui/material'
import { Order, OrderStatus } from '@/types/order-types'
import { STATUS_CONFIGS } from './order-config'

interface OrderStatusMenuProps {
  anchorEl: null | HTMLElement
  targetOrder: Order | null
  onClose: () => void
  onSelectStatus: (status: OrderStatus) => void
}

const AVAILABLE_STATUSES: OrderStatus[] = [
  'PLACED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'REJECTED',
  'CANCELLED',
]

export function OrderStatusMenu({
  anchorEl,
  targetOrder,
  onClose,
  onSelectStatus,
}: OrderStatusMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: 200,
        },
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
          Change Order Status
        </Typography>
      </Box>
      <Divider sx={{ my: 0.5 }} />
      {AVAILABLE_STATUSES.map((status) => {
        const cfg = STATUS_CONFIGS[status]
        const isCurrent = targetOrder?.status === status

        return (
          <MenuItem
            key={status}
            onClick={(e) => {
              e.stopPropagation()
              onSelectStatus(status)
            }}
            sx={{
              fontSize: '0.85rem',
              fontWeight: isCurrent ? 700 : 500,
              color: cfg.color,
              display: 'flex',
              gap: 1,
              bgcolor: isCurrent ? cfg.bgColor : 'transparent',
            }}
          >
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
          </MenuItem>
        )
      })}
    </Menu>
  )
}
