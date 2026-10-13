'use client'

import React from 'react'
import Link from 'next/link'
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Switch,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RefreshIcon from '@mui/icons-material/Refresh'
import AddIcon from '@mui/icons-material/Add'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'

interface OrderHeaderProps {
  soundEnabled: boolean
  onToggleSound: () => void
  autoRefresh: boolean
  onToggleAutoRefresh: (val: boolean) => void
  isRefreshing: boolean
  onManualRefresh: () => void
  onCreateDemoOrder: () => void
}

export function OrderHeader({
  soundEnabled,
  onToggleSound,
  autoRefresh,
  onToggleAutoRefresh,
  isRefreshing,
  onManualRefresh,
  onCreateDemoOrder,
}: OrderHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Top Back Navigation Link */}
      <Box sx={{ mb: 1.5 }}>
        <Button
          component={Link}
          href="/owner/dashboard"
          startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
          sx={{
            color: '#64748b',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            px: 1,
            py: 0.4,
            borderRadius: '6px',
            '&:hover': { color: '#0f172a', bgcolor: 'rgba(0,0,0,0.04)' },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Main Header Card */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          bgcolor: '#ffffff',
          p: { xs: 2, sm: 2.5 },
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {/* Left: Title & Status */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Live Orders & Kitchen Display
            </Typography>
            <Chip
              label="LIVE"
              size="small"
              sx={{
                bgcolor: '#f0fdf4',
                color: '#16a34a',
                fontWeight: 800,
                border: '1px solid #bbf7d0',
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.2 }}>
            Track and progress orders: <strong>Preparing</strong>, <strong>Ready</strong>, and <strong>Picked Up</strong>
          </Typography>
        </Box>

      {/* Right: Controls & Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {/* Sound Chime Toggle */}
        <Tooltip title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}>
          <IconButton
            size="small"
            onClick={onToggleSound}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              bgcolor: soundEnabled ? '#eff6ff' : '#f8fafc',
              color: soundEnabled ? '#2563eb' : '#94a3b8',
            }}
          >
            {soundEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Auto Refresh Toggle */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: '#f8fafc',
            px: 1.2,
            py: 0.3,
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
            Auto-Refresh (15s)
          </Typography>
          <Switch
            checked={autoRefresh}
            onChange={(e) => onToggleAutoRefresh(e.target.checked)}
            size="small"
            color="primary"
          />
        </Box>

        {/* Manual Refresh Button */}
        <Button
          variant="outlined"
          size="small"
          onClick={onManualRefresh}
          disabled={isRefreshing}
          startIcon={<RefreshIcon sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />}
          sx={{
            borderRadius: '8px',
            borderColor: '#e2e8f0',
            color: '#475569',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        >
          Refresh
        </Button>

        {/* Demo Order Button */}
        <Button
          variant="contained"
          size="small"
          onClick={onCreateDemoOrder}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: '8px',
            bgcolor: '#ea580c',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            '&:hover': { bgcolor: '#c2410c' },
          }}
        >
          + Demo Order
        </Button>
      </Box>
    </Box>
    </Box>
  )
}
