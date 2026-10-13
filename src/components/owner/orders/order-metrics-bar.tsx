'use client'

import React from 'react'
import { Box, Typography, Chip } from '@mui/material'

export interface OrderCounts {
  all: number
  new: number
  preparing: number
  ready: number
  pickedUp: number
  completed: number
  cancelled: number
}

interface OrderMetricsBarProps {
  counts: OrderCounts
  onSelectFilter: (tab: string) => void
}

export function OrderMetricsBar({ counts, onSelectFilter }: OrderMetricsBarProps) {
  const metricCards = [
    {
      id: 'NEW',
      title: '🔔 Incoming',
      count: counts.new,
      subtitle: 'Needs action',
      badgeColor: '#ea580c',
      badgeBg: '#fff7ed',
      borderColor: counts.new > 0 ? '#fed7aa' : '#e2e8f0',
      hoverBorder: '#ea580c',
    },
    {
      id: 'PREPARING',
      title: '🍳 Preparing',
      count: counts.preparing,
      subtitle: 'Cooking in kitchen',
      badgeColor: '#7c3aed',
      badgeBg: '#f5f3ff',
      borderColor: counts.preparing > 0 ? '#ddd6fe' : '#e2e8f0',
      hoverBorder: '#7c3aed',
    },
    {
      id: 'READY',
      title: '🛎️ Ready',
      count: counts.ready,
      subtitle: 'At pickup counter',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      borderColor: counts.ready > 0 ? '#bbf7d0' : '#e2e8f0',
      hoverBorder: '#16a34a',
    },
    {
      id: 'PICKED_UP',
      title: '🛵 Picked Up',
      count: counts.pickedUp,
      subtitle: 'Handed over / En route',
      badgeColor: '#0d9488',
      badgeBg: '#f0fdfa',
      borderColor: counts.pickedUp > 0 ? '#99f6e4' : '#e2e8f0',
      hoverBorder: '#0d9488',
    },
    {
      id: 'COMPLETED',
      title: '✅ Delivered',
      count: counts.completed,
      subtitle: 'Completed orders',
      badgeColor: '#475569',
      badgeBg: '#f1f5f9',
      borderColor: '#e2e8f0',
      hoverBorder: '#475569',
    },
    {
      id: 'ALL',
      title: '📦 All Orders',
      count: counts.all,
      subtitle: 'Total volume',
      badgeColor: '#0f172a',
      badgeBg: '#f8fafc',
      borderColor: '#e2e8f0',
      hoverBorder: '#0f172a',
    },
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(6, 1fr)',
        },
        gap: 1.5,
        mb: 3,
      }}
    >
      {metricCards.map((card) => (
        <Box
          key={card.id}
          onClick={() => onSelectFilter(card.id)}
          sx={{
            p: 1.8,
            borderRadius: '10px',
            bgcolor: '#ffffff',
            border: '1px solid',
            borderColor: card.borderColor,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: card.hoverBorder,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: card.badgeColor, textTransform: 'uppercase' }}>
              {card.title}
            </Typography>
            <Chip
              label={card.count}
              size="small"
              sx={{ bgcolor: card.badgeBg, color: card.badgeColor, fontWeight: 800, height: 20 }}
            />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 1 }}>
            {card.count}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            {card.subtitle}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
