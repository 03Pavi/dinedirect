'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
  Skeleton,
  Divider,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import PhoneIcon from '@mui/icons-material/Phone'


import Navbar from '@/components/common/navbar'
import { RestaurantInput } from '@/schemas/restaurant-schema'
import { RestaurantSetupWizard } from '@/components/owner/restaurant-setup-wizard'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsOwner,
  selectAuthInitialized,
} from '@/store/selectors/auth-selectors'
import {
  selectMyRestaurant,
  selectRestaurantLoading,
  selectRestaurantError,
} from '@/store/selectors/restaurant-selectors'
import { fetchMyRestaurantThunk } from '@/store/thunks/fetch-my-restaurant-thunk'
import { createRestaurantThunk } from '@/store/thunks/create-restaurant-thunk'
import { updateRestaurantThunk } from '@/store/thunks/update-restaurant-thunk'

export default function OwnerDashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isOwner = useAppSelector(selectIsOwner)
  const authInitialized = useAppSelector(selectAuthInitialized)

  const restaurant = useAppSelector(selectMyRestaurant)
  const loading = useAppSelector(selectRestaurantLoading)
  const error = useAppSelector(selectRestaurantError)

  const [formError, setFormError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check auth & redirect if not owner
  useEffect(() => {
    if (authInitialized) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (!isOwner) {
        router.push('/')
      } else {
        dispatch(fetchMyRestaurantThunk())
      }
    }
  }, [authInitialized, isAuthenticated, isOwner, router, dispatch])

  const handleCreateRestaurant = async (data: RestaurantInput) => {
    setFormError(null)
    setIsSubmitting(true)
    const resultAction = await dispatch(createRestaurantThunk(data))
    if (createRestaurantThunk.rejected.match(resultAction)) {
      setFormError(resultAction.payload || 'Failed to create restaurant')
    }
    setIsSubmitting(false)
  }

  const handleToggleOpen = async () => {
    if (!restaurant) return
    setUpdatingStatus(true)
    await dispatch(
      updateRestaurantThunk({
        id: restaurant.id,
        isOpen: !restaurant.isOpen,
      })
    )
    setUpdatingStatus(false)
  }

  if (!authInitialized || (loading && !restaurant)) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '8px', mb: 3 }} />
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '8px' }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '8px' }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '8px' }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 }, px: { xs: 2, sm: 3 }, flexGrow: 1 }}>
        {/* If Restaurant already exists */}
        {restaurant ? (
          <Stack spacing={3}>
            {/* Header Card */}
            <Card
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                width: '100%',
              }}
            >
              {/* Top Row: Name, Status & Store Toggle */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2,
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {restaurant.name}
                  </Typography>
                  <Chip
                    label={restaurant.isOpen ? 'ONLINE' : 'OFFLINE'}
                    color={restaurant.isOpen ? 'success' : 'default'}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.75rem', height: 24, borderRadius: '6px' }}
                  />
                </Box>

                {/* Dedicated Store Open/Closed Toggle Control */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: restaurant.isOpen ? '#f0fdf4' : '#f8fafc',
                    border: '1px solid',
                    borderColor: restaurant.isOpen ? '#bbf7d0' : '#e2e8f0',
                    borderRadius: '30px',
                    py: 0.6,
                    px: 2,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: restaurant.isOpen ? '#166534' : '#64748b',
                      fontSize: '0.85rem',
                      userSelect: 'none',
                    }}
                  >
                    {updatingStatus ? 'Updating...' : restaurant.isOpen ? 'Store Open' : 'Store Closed'}
                  </Typography>
                  <Switch
                    checked={restaurant.isOpen}
                    onChange={handleToggleOpen}
                    disabled={updatingStatus}
                    color="success"
                    size="small"
                  />
                </Box>
              </Box>

              {/* Description */}
              {restaurant.description && (
                <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, maxWidth: '800px', lineHeight: 1.6 }}>
                  {restaurant.description}
                </Typography>
              )}

              {/* Info Badges (Location, Phone, Timings) */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: { xs: 1.5, sm: 3 },
                  color: '#475569',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  mb: 2.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <LocationOnIcon sx={{ color: '#ea580c', fontSize: 18 }} />
                  <span>{restaurant.address}, {restaurant.city}</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <PhoneIcon sx={{ color: '#ea580c', fontSize: 18 }} />
                  <span>{restaurant.phone}</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <AccessTimeIcon sx={{ color: '#ea580c', fontSize: 18 }} />
                  <span>{restaurant.openingTime} - {restaurant.closingTime}</span>
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />

              {/* Bottom Row: Cuisines & Quick Rules */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
                    CUISINES:
                  </Typography>
                  {(Array.isArray(restaurant.cuisine) ? restaurant.cuisine : []).map((c: string) => (
                    <Chip
                      key={c}
                      label={c}
                      size="small"
                      sx={{
                        backgroundColor: '#fff7ed',
                        color: '#ea580c',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: '1px solid #ffedd5',
                        fontSize: '0.75rem',
                        height: 24,
                      }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Delivery Fee: <strong style={{ color: '#0f172a' }}>₹{restaurant.deliveryFee}</strong>
                  </Typography>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Min Order: <strong style={{ color: '#0f172a' }}>₹{restaurant.minOrder}</strong>
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Quick Actions Grid - Perfectly Aligned & Equal Height */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 2.5,
                width: '100%',
              }}
            >
              {/* Card 1: Menu & Categories */}
              <Card
                component={Link}
                href="/owner/menu"
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#f97316',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 24px -8px rgba(249, 115, 22, 0.15)',
                    '& .action-arrow-1': {
                      transform: 'translateX(4px)',
                      color: '#ea580c',
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: '#fff7ed',
                      color: '#ea580c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #ffedd5',
                    }}
                  >
                    <RestaurantMenuIcon fontSize="small" />
                  </Box>
                  <ArrowForwardIcon className="action-arrow-1" sx={{ color: '#cbd5e1', fontSize: 20, transition: 'all 0.2s ease' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: '1.05rem' }}>
                  Menu & Categories
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, flexGrow: 1, mb: 2.5 }}>
                  Add, edit items, set prices, dish availability, and organize food categories.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#ea580c', fontWeight: 700, fontSize: '0.85rem', mt: 'auto' }}>
                  <span>Manage Menu</span>
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Card>

              {/* Card 2: Live Kitchen Orders */}
              <Card
                component={Link}
                href="/owner/orders"
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#f97316',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 24px -8px rgba(249, 115, 22, 0.15)',
                    '& .action-arrow-2': {
                      transform: 'translateX(4px)',
                      color: '#16a34a',
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: '#f0fdf4',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #dcfce7',
                    }}
                  >
                    <ReceiptLongIcon fontSize="small" />
                  </Box>
                  <ArrowForwardIcon className="action-arrow-2" sx={{ color: '#cbd5e1', fontSize: 20, transition: 'all 0.2s ease' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: '1.05rem' }}>
                  Live Kitchen Orders
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, flexGrow: 1, mb: 2.5 }}>
                  Accept orders, change status to Preparing, Ready, Out for delivery, or Delivered.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', mt: 'auto' }}>
                  <span>Live Orders</span>
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Card>

              {/* Card 3: Table QR Codes & Scans */}
              <Card
                component={Link}
                href="/owner/qr"
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#4338ca',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 24px -8px rgba(67, 56, 202, 0.15)',
                    '& .action-arrow-qr': {
                      transform: 'translateX(4px)',
                      color: '#4338ca',
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: '#eef2ff',
                      color: '#4338ca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e0e7ff',
                    }}
                  >
                    <QrCode2Icon fontSize="small" />
                  </Box>
                  <ArrowForwardIcon className="action-arrow-qr" sx={{ color: '#cbd5e1', fontSize: 20, transition: 'all 0.2s ease' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: '1.05rem' }}>
                  Table QR & Scans
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, flexGrow: 1, mb: 2.5 }}>
                  Generate table QR codes, customize design, print acrylic stands, and track customer scan metrics.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#4338ca', fontWeight: 700, fontSize: '0.85rem', mt: 'auto' }}>
                  <span>QR Studio</span>
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Card>

              {/* Card 4: Coupons & Special Offers */}
              <Card
                component={Link}
                href="/owner/coupons"
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#ea580c',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 24px -8px rgba(234, 88, 12, 0.15)',
                    '& .action-arrow-cpn': {
                      transform: 'translateX(4px)',
                      color: '#ea580c',
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: '#fff7ed',
                      color: '#ea580c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #ffedd5',
                    }}
                  >
                    <LocalOfferIcon fontSize="small" />
                  </Box>
                  <ArrowForwardIcon className="action-arrow-cpn" sx={{ color: '#cbd5e1', fontSize: 20, transition: 'all 0.2s ease' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: '1.05rem' }}>
                  Coupons & Offers
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, flexGrow: 1, mb: 2.5 }}>
                  Create promotional discount codes, percentage deals, minimum order caps, and flash sales.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#ea580c', fontWeight: 700, fontSize: '0.85rem', mt: 'auto' }}>
                  <span>Offers Studio</span>
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Card>
            </Box>
          </Stack>
        ) : (
          /* If no restaurant created yet -> Show Multi-Screen Setup Wizard */
          <RestaurantSetupWizard
            onSubmit={handleCreateRestaurant}
            isSubmitting={isSubmitting}
            formError={formError || error}
          />
        )}
      </Container>
    </Box>
  )
}
