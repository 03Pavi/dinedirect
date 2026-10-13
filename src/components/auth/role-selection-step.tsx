'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import StorefrontIcon from '@mui/icons-material/Storefront'
import CheckIcon from '@mui/icons-material/Check'
import { useThemeMode } from './auth-theme-context'

export interface RoleSelectionStepProps {
  selectedRole: 'customer' | 'owner'
  onSelectRole: (role: 'customer' | 'owner') => void
}

export function RoleSelectionStep({ selectedRole, onSelectRole }: RoleSelectionStepProps) {
  const { mode } = useThemeMode()

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="h5"
        align="center"
        color="text.primary"
        sx={{
          fontWeight: 800,
          mb: 0.5,
          letterSpacing: '-0.01em',
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
        }}
      >
        SELECT YOUR ACCOUNT TYPE
      </Typography>
      <Typography
        variant="body2"
        align="center"
        color="text.secondary"
        sx={{ mb: { xs: 2.5, sm: 4 }, fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
      >
        Choose how you wish to interact with the DineDirect platform.
      </Typography>

      {/* Side-by-side Left and Right Layout across all screen sizes */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: { xs: 1.25, sm: 2.5 },
          width: '100%',
        }}
      >
        {/* Customer Role Card (Left) */}
        <Box
          onClick={() => onSelectRole('customer')}
          sx={{
            width: '100%',
            p: { xs: 1.5, sm: 3 },
            cursor: 'pointer',
            borderRadius: { xs: '10px', sm: '12px' },
            border: '2px solid',
            borderColor: selectedRole === 'customer' ? '#f97316' : mode === 'light' ? '#cbd5e1' : '#334155',
            bgcolor:
              selectedRole === 'customer'
                ? mode === 'light'
                  ? '#fff7ed'
                  : '#1c1917'
                : mode === 'light'
                ? '#ffffff'
                : '#0f172a',
            position: 'relative',
            transition: 'all 0.15s ease-in-out',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            '&:hover': { borderColor: '#f97316' },
          }}
        >
          {selectedRole === 'customer' && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bgcolor: '#f97316',
                color: '#ffffff',
                p: { xs: '2px 6px', sm: '4px 10px' },
                borderBottomLeftRadius: '8px',
                borderTopRightRadius: { xs: '8px', sm: '10px' },
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CheckIcon sx={{ fontSize: { xs: 13, sm: 16 } }} />
            </Box>
          )}
          <Box
            sx={{
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              borderRadius: '8px',
              bgcolor: selectedRole === 'customer' ? '#f97316' : mode === 'light' ? '#94a3b8' : '#334155',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: { xs: 1.2, sm: 2 },
            }}
          >
            <PersonIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              fontSize: { xs: '0.82rem', sm: '1rem' },
              lineHeight: 1.25,
            }}
          >
            Order Food (Customer)
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.35,
              fontWeight: 500,
              fontSize: { xs: '0.72rem', sm: '0.85rem' },
              flexGrow: 1,
            }}
          >
            Discover top restaurants, order food from your table, and track live statuses.
          </Typography>
        </Box>

        {/* Owner Role Card (Right) */}
        <Box
          onClick={() => onSelectRole('owner')}
          sx={{
            width: '100%',
            p: { xs: 1.5, sm: 3 },
            cursor: 'pointer',
            borderRadius: { xs: '10px', sm: '12px' },
            border: '2px solid',
            borderColor: selectedRole === 'owner' ? '#f97316' : mode === 'light' ? '#cbd5e1' : '#334155',
            bgcolor:
              selectedRole === 'owner'
                ? mode === 'light'
                  ? '#fff7ed'
                  : '#1c1917'
                : mode === 'light'
                ? '#ffffff'
                : '#0f172a',
            position: 'relative',
            transition: 'all 0.15s ease-in-out',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            '&:hover': { borderColor: '#f97316' },
          }}
        >
          {selectedRole === 'owner' && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bgcolor: '#f97316',
                color: '#ffffff',
                p: { xs: '2px 6px', sm: '4px 10px' },
                borderBottomLeftRadius: '8px',
                borderTopRightRadius: { xs: '8px', sm: '10px' },
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CheckIcon sx={{ fontSize: { xs: 13, sm: 16 } }} />
            </Box>
          )}
          <Box
            sx={{
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              borderRadius: '8px',
              bgcolor: selectedRole === 'owner' ? '#f97316' : mode === 'light' ? '#94a3b8' : '#334155',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: { xs: 1.2, sm: 2 },
            }}
          >
            <StorefrontIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              fontSize: { xs: '0.82rem', sm: '1rem' },
              lineHeight: 1.25,
            }}
          >
            List Restaurant (Owner)
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.35,
              fontWeight: 500,
              fontSize: { xs: '0.72rem', sm: '0.85rem' },
              flexGrow: 1,
            }}
          >
            Manage dine-in table orders, customize menus, and streamline kitchen workflow.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
export default RoleSelectionStep
