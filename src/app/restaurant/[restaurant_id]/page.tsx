'use client'

import React, { useEffect, useState, useMemo, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Drawer,
  Typography,
  Button,
  Badge,
  Skeleton,
  Stack,
  Card,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { CustomerSidebar } from '@/components/customer/customer-sidebar'
import { CustomerHeader } from '@/components/customer/customer-header'
import { RestaurantDetailView } from '@/components/customer/restaurant-detail-view'
import { CartSidebar } from '@/components/customer/cart-sidebar'
import { Restaurant } from '@/types/restaurant-types'
import { apiClient } from '@/utils/api-client'
import { useAppSelector } from '@/store/hooks'
import { useHistoryModal } from '@/hooks/use-history-modal'

function RestaurantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const restaurantId = (params?.restaurant_id as string) || (params?.id as string) || ''
  const cart = useAppSelector((state) => state.cart)

  const [activeNav, setActiveNav] = useState('Home')
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Responsive Drawer States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  useHistoryModal({
    open: mobileSidebarOpen,
    onClose: () => setMobileSidebarOpen(false),
    modalId: 'mobile-sidebar',
  })
  useHistoryModal({
    open: mobileCartOpen,
    onClose: () => setMobileCartOpen(false),
    modalId: 'mobile-cart',
  })

  // Record QR Scan event if arriving via Table QR Code
  useEffect(() => {
    const qrId = searchParams.get('qrId')
    if (qrId) {
      fetch('/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrId }),
      }).catch(() => {})
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchRestaurant() {
      if (!restaurantId) return
      setLoading(true)
      setNotFound(false)
      try {
        const res = await apiClient.get<{ restaurant?: Restaurant; restaurants?: Restaurant[] }>(
          `/api/restaurants/${restaurantId}`
        ).catch(async () => {
          // Fallback to query all
          const allRes = await apiClient.get<{ restaurants: Restaurant[] }>('/api/restaurants')
          const found = allRes.restaurants?.find((r) => r.id === restaurantId)
          return { restaurant: found }
        })

        if (res.restaurant) {
          setRestaurant(res.restaurant)
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.error('Failed to load restaurant details:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [restaurantId])

  const totalCartCount = cart.items.reduce((sum, it) => sum + it.quantity, 0)

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#f8fafc' }}>
      {/* 1. LEFT SIDEBAR: Permanent on Desktop (md+) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 220,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
        }}
      >
        <CustomerSidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      </Box>

      {/* LEFT SIDEBAR: Temporary Drawer on Mobile/Tablet */}
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 260 } }}
      >
        <CustomerSidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onItemClick={() => setMobileSidebarOpen(false)}
        />
      </Drawer>

      {/* 2. CENTER CONTENT AREA: Responsive main column */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          borderRight: { lg: '1px solid #f1f5f9' },
        }}
      >
        {/* Sticky Customer Header */}
        <CustomerHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode="restaurants"
          onViewModeChange={(mode) => {
            if (mode === 'dishes') {
              router.push('/home?dishes=true')
            } else {
              router.push('/home')
            }
          }}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenMobileCart={() => setMobileCartOpen(true)}
          cartItemCount={totalCartCount}
        />

        {/* Content Container */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, flex: 1 }}>
          {loading ? (
            /* Skeleton Loading State for Restaurant Detail */
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: '10px' }} />
              </Box>
              <Skeleton
                variant="rectangular"
                animation="wave"
                height={220}
                sx={{ borderRadius: '20px', mb: 3, bgcolor: '#f1f5f9' }}
              />
              <Skeleton
                variant="text"
                animation="wave"
                width="40%"
                height={40}
                sx={{ borderRadius: '6px', mb: 1 }}
              />
              <Skeleton
                variant="text"
                animation="wave"
                width="25%"
                height={20}
                sx={{ borderRadius: '6px', mb: 3 }}
              />
              <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" width={80} height={32} sx={{ borderRadius: '16px' }} />
                ))}
              </Box>
              <Stack spacing={2.5}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Card key={idx} elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1.5px solid #f1f5f9' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Skeleton variant="rectangular" width={110} height={100} sx={{ borderRadius: '12px' }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="50%" height={26} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="20%" height={22} />
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </Box>
          ) : notFound || !restaurant ? (
            /* Not Found State */
            <Box
              sx={{
                textAlign: 'center',
                py: 10,
                bgcolor: '#ffffff',
                borderRadius: '20px',
                border: '1.5px dashed #e2e8f0',
                px: 3,
              }}
            >
              <StorefrontIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 1.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Restaurant Not Found
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 400, mx: 'auto', mb: 3 }}>
                The dining spot you're looking for might be temporarily unavailable or closed.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/home')}
                startIcon={<ArrowBackIcon />}
                sx={{
                  bgcolor: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#c2410c' },
                }}
              >
                Back to Home
              </Button>
            </Box>
          ) : (
            /* Real Restaurant Detail View */
            <RestaurantDetailView
              restaurant={restaurant}
              onBack={() => router.push('/home')}
            />
          )}
        </Box>
      </Box>

      {/* 3. RIGHT SIDEBAR: "Order Menu" Permanent on Desktop (lg+) */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: 350,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 90,
        }}
      >
        <CartSidebar />
      </Box>

      {/* RIGHT SIDEBAR: "Order Menu" Temporary Drawer on Mobile & Tablet */}
      <Drawer
        anchor="right"
        open={mobileCartOpen}
        onClose={() => setMobileCartOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 380 } } }}
      >
        <CartSidebar onClose={() => setMobileCartOpen(false)} isDrawer />
      </Drawer>

      {/* Floating Bottom Cart Bar for Mobile when Cart has items */}
      {cart.items.length > 0 && (
        <Box
          sx={{
            display: { xs: 'flex', lg: 'none' },
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 1000,
            bgcolor: '#ea580c',
            color: '#ffffff',
            borderRadius: '16px',
            p: 1.8,
            boxShadow: '0 12px 28px rgba(234, 88, 12, 0.45)',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setMobileCartOpen(true)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Badge badgeContent={totalCartCount} color="default">
              <ShoppingBagIcon sx={{ color: '#ffffff' }} />
            </Badge>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} added
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Rs {cart.subtotal}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, pl: 1, borderLeft: '1px solid rgba(255,255,255,0.4)' }}>
              View Order →
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default function RestaurantPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ p: 4 }}>
          <Skeleton variant="rounded" height={60} sx={{ mb: 3, borderRadius: '16px' }} />
          <Skeleton variant="rectangular" height={220} sx={{ mb: 3, borderRadius: '16px' }} />
        </Box>
      }
    >
      <RestaurantDetailPage />
    </Suspense>
  )
}
