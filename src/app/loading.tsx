import React from 'react'
import { Box, Container, Skeleton, Stack, CircularProgress, Typography } from '@mui/material'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'

export default function Loading() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F8F9FA',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Navbar Skeleton */}
      <Box
        sx={{
          py: 2,
          px: 3,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="text" width={120} height={32} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>

      {/* Main Body Loader */}
      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            backgroundColor: 'rgba(232, 93, 4, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#E85D04',
            mb: 3,
            position: 'relative',
          }}
        >
          <RestaurantMenuIcon sx={{ fontSize: 32 }} />
          <CircularProgress
            size={76}
            thickness={2}
            sx={{
              color: '#E85D04',
              position: 'absolute',
            }}
          />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1D2A44', mb: 1 }}>
          Loading DineDirect
        </Typography>
        <Typography variant="body2" sx={{ color: '#6C757D', mb: 4 }}>
          Preparing your restaurant experience...
        </Typography>

        {/* Content Skeletons */}
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 600 }}>
          <Skeleton variant="rounded" height={60} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
        </Stack>
      </Container>
    </Box>
  )
}
