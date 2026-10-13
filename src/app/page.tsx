'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/common/navbar'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PaymentIcon from '@mui/icons-material/Payment'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DashboardIcon from '@mui/icons-material/Dashboard'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsOwner,
  selectAuthInitialized,
} from '@/store/selectors/auth-selectors'
import { fetchMeThunk } from '@/store/thunks/fetch-me-thunk'

const features = [
  {
    icon: <QrCodeScannerIcon sx={{ fontSize: 36, color: '#E85D04' }} />,
    title: 'Scan & Order at Table',
    description:
      'Guests scan the QR code at their table to browse rich digital menus with photos, dietary filters, and customizations.',
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 36, color: '#E85D04' }} />,
    title: 'Real-Time Kitchen Sync',
    description:
      'Orders route directly to kitchen display systems instantly, minimizing order latency and kitchen mistakes.',
  },
  {
    icon: <PaymentIcon sx={{ fontSize: 36, color: '#E85D04' }} />,
    title: 'Seamless Digital Payments',
    description:
      'Support UPI, credit cards, split-bill payments, and instant digital receipts right from personal smartphones.',
  },
]


export default function HomePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isOwner = useAppSelector(selectIsOwner)
  const initialized = useAppSelector(selectAuthInitialized)

  useEffect(() => {
    if (!initialized) {
      dispatch(fetchMeThunk())
    }
  }, [dispatch, initialized])

  // Direct send restaurant owner to dashboard if already logged in
  useEffect(() => {
    if (initialized && isAuthenticated && isOwner) {
      router.replace('/owner/dashboard')
    }
  }, [initialized, isAuthenticated, isOwner, router])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 10 },
          background:
            'radial-gradient(circle at 50% 10%, rgba(232, 93, 4, 0.08) 0%, rgba(248, 249, 250, 0) 70%)',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip
            icon={<CheckCircleOutlineIcon sx={{ '&&': { color: '#E85D04' } }} />}
            label={
              isAuthenticated && user
                ? `Welcome back, ${user.name}`
                : 'Next-Gen Dine-In Experience'
            }
            sx={{
              backgroundColor: 'rgba(232, 93, 4, 0.1)',
              color: '#D00000',
              fontWeight: 700,
              mb: 3,
              px: 1,
            }}
          />

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.75rem' },
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#1D2A44',
              letterSpacing: '-0.03em',
              mb: 3,
            }}
          >
            Smarter Table Ordering for Modern Restaurants
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#6C757D',
              fontWeight: 400,
              lineHeight: 1.6,
              mb: 5,
              maxWidth: 680,
              mx: 'auto',
            }}
          >
            Empower guests to browse menus, order food, and settle bills directly from
            their phones—boosting table turnover and customer satisfaction.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            {isAuthenticated ? (
              isOwner ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    component={Link}
                    href="/owner/dashboard"
                    startIcon={<DashboardIcon />}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(232, 93, 4, 0.3)',
                    }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    component={Link}
                    href="/menu"
                    startIcon={<RestaurantMenuIcon />}
                    sx={{ px: 4, py: 1.5, fontSize: '1.05rem', fontWeight: 700 }}
                  >
                    Explore Menu
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    component={Link}
                    href="/menu"
                    startIcon={<RestaurantMenuIcon />}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 5,
                      py: 1.6,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(232, 93, 4, 0.3)',
                    }}
                  >
                    Explore Menu
                  </Button>
                </>
              )
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={Link}
                  href="/register"
                  sx={{ px: 4, py: 1.5, fontSize: '1.05rem' }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  component={Link}
                  href="/login"
                  sx={{ px: 4, py: 1.5, fontSize: '1.05rem' }}
                >
                  Sign In
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4}>
          {features.map((feature, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      backgroundColor: 'rgba(232, 93, 4, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6C757D', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          py: 4,
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          backgroundColor: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: '#6C757D' }}>
            &copy; {new Date().getFullYear()} DineIn. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
