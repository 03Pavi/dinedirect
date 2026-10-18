'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Drawer,
  Typography,
  Button,
  Stack,
  Badge,
  Card,
  Chip,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { CustomerSidebar } from '@/components/customer/customer-sidebar'
import { CustomerHeader } from '@/components/customer/customer-header'
import { CartSidebar } from '@/components/customer/cart-sidebar'

import { useAppSelector } from '@/store/hooks'
import { useHistoryModal } from '@/hooks/use-history-modal'
import { apiClient } from '@/utils/api-client'

interface LiveCoupon {
  id: string
  restaurantId: string
  code: string
  description?: string
  discountType: 'PERCENTAGE' | 'FLAT'
  discountValue: number
  minOrderAmount: number
  maxDiscount?: number
  expiresAt?: string | null
  restaurant?: {
    id: string
    name: string
    imageUrl?: string
    city?: string
  }
}

function OffersContent() {
  const router = useRouter()
  const cart = useAppSelector((state) => state.cart)

  const [coupons, setCoupons] = useState<LiveCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    apiClient
      .get<{ coupons: LiveCoupon[] }>('/api/coupons')
      .then((res) => {
        if (res?.coupons && Array.isArray(res.coupons)) {
          setCoupons(res.coupons)
        } else {
          setCoupons([])
        }
      })
      .catch(() => {
        setCoupons([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Responsive Drawer States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  useHistoryModal({
    open: mobileSidebarOpen,
    onClose: () => setMobileSidebarOpen(false),
    modalId: 'mobile-sidebar-offers',
  })
  useHistoryModal({
    open: mobileCartOpen,
    onClose: () => setMobileCartOpen(false),
    modalId: 'mobile-cart-offers',
  })

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setToastOpen(true)
  }

  const totalCartCount = cart.items.reduce((sum, it) => sum + it.quantity, 0)

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#f8fafc' }}>
      {/* 1. LEFT SIDEBAR */}
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
        <CustomerSidebar activeNav="Offers" />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 260 } }}
      >
        <CustomerSidebar activeNav="Offers" onItemClick={() => setMobileSidebarOpen(false)} />
      </Drawer>

      {/* 2. CENTER CONTENT */}
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
        <CustomerHeader
          searchQuery=""
          onSearchChange={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
          viewMode="dishes"
          onViewModeChange={() => router.push('/home')}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenMobileCart={() => setMobileCartOpen(true)}
          cartItemCount={totalCartCount}
        />

        <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, flex: 1 }}>
          {/* Header Banner */}
          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              mb: 3.5,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 28px rgba(234, 88, 12, 0.25)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <LocalOfferIcon sx={{ fontSize: 28 }} />
              <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.1em', opacity: 0.9 }}>
                PROMOTIONS & DISCOUNTS
              </Typography>
            </Stack>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
              Deals & Coupons
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 500, fontSize: '0.95rem' }}>
              Copy promo codes to unlock savings on dine-in meals, takeaway bags, and doorstep deliveries.
            </Typography>
          </Box>

          {/* Scratch & Win Feature Banner */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
              color: '#ffffff',
              mb: 3.5,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              boxShadow: '0 8px 24px rgba(67, 56, 202, 0.25)',
              border: '1px solid #4f46e5',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                <Chip
                  label="NEW FEATURE"
                  size="small"
                  sx={{ bgcolor: '#fbbf24', color: '#78350f', fontWeight: 900, fontSize: '0.68rem', height: 20 }}
                />
                <Typography variant="caption" sx={{ color: '#c7d2fe', fontWeight: 700, letterSpacing: '0.04em' }}>
                  LUCKY REWARDS
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5 }}>
                🎁 Scratch & Win Mystery Coupons!
              </Typography>
              <Typography variant="body2" sx={{ color: '#e0e7ff', maxWidth: 440, fontSize: '0.88rem' }}>
                Rub off interactive scratch cards with your finger to reveal secret dining discount coupons and instant rewards!
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={() => router.push('/scratch')}
              sx={{
                bgcolor: '#ea580c',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.88rem',
                borderRadius: '12px',
                px: 3,
                py: 1.2,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
                flexShrink: 0,
                '&:hover': { bgcolor: '#c2410c' },
              }}
            >
              Play Scratch Card
            </Button>
          </Box>

          {/* Deals Grid */}
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            Available Restaurant Offers ({loading ? '...' : coupons.length})
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 3,
              }}
            >
              {[1, 2, 3, 4].map((n) => (
                <Skeleton
                  key={n}
                  variant="rounded"
                  height={180}
                  sx={{ borderRadius: '18px', bgcolor: '#f1f5f9' }}
                />
              ))}
            </Box>
          ) : coupons.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                p: { xs: 4, sm: 6 },
                textAlign: 'center',
                borderRadius: '20px',
                border: '1.5px dashed #e2e8f0',
                bgcolor: '#ffffff',
                maxWidth: 600,
                mx: 'auto',
                mt: 4,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '16px',
                  bgcolor: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <LocalOfferIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                No Active Offers Available
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3, lineHeight: 1.6 }}>
                Restaurant owners create exclusive discount coupons and dining promotions from their Owner Dashboard. Check back soon for fresh deals!
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/home')}
                startIcon={<StorefrontIcon />}
                sx={{
                  bgcolor: '#ea580c',
                  '&:hover': { bgcolor: '#c2410c' },
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: '10px',
                }}
              >
                Browse Menus
              </Button>
            </Card>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 3,
              }}
            >
              {coupons.map((coupon) => {
                const discountLabel =
                  coupon.discountType === 'PERCENTAGE'
                    ? `${coupon.discountValue}% OFF`
                    : `₹${coupon.discountValue} OFF`

                const expiryText = coupon.expiresAt
                  ? `Valid till ${new Date(coupon.expiresAt).toLocaleDateString()}`
                  : 'Active offer'

                return (
                  <Card
                    key={coupon.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '18px',
                      border: '1.5px dashed #cbd5e1',
                      bgcolor: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#ea580c',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 24px -8px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Chip
                          icon={coupon.restaurant?.name ? <StorefrontIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                          label={coupon.restaurant?.name || 'RESTAURANT OFFER'}
                          size="small"
                          sx={{
                            bgcolor: '#fff7ed',
                            color: '#ea580c',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '6px',
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 13 }} />
                          {expiryText}
                        </Typography>
                      </Box>

                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#ea580c', mb: 0.5 }}>
                        {discountLabel}
                      </Typography>

                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                        {coupon.code}
                      </Typography>

                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.86rem', mb: 1.5, lineHeight: 1.4 }}>
                        {coupon.description || `Get ${discountLabel} on your dining order.`}
                      </Typography>

                      {coupon.minOrderAmount > 0 && (
                        <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600, display: 'block', mb: 2 }}>
                          Min order: ₹{coupon.minOrderAmount}
                          {coupon.maxDiscount ? ` • Max savings: ₹${coupon.maxDiscount}` : ''}
                        </Typography>
                      )}
                    </Box>

                    {/* Coupon Code Pill & Copy Button */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: '#f8fafc',
                        p: 1.2,
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <Box sx={{ pl: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', lineHeight: 1 }}>
                          PROMO CODE
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em' }}>
                          {coupon.code}
                        </Typography>
                      </Box>

                      <Button
                        size="small"
                        onClick={() => handleCopyCode(coupon.code)}
                        startIcon={copiedCode === coupon.code ? <CheckCircleIcon /> : <ContentCopyIcon />}
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 700,
                          textTransform: 'none',
                          bgcolor: copiedCode === coupon.code ? '#dcfce7' : '#ffffff',
                          color: copiedCode === coupon.code ? '#15803d' : '#ea580c',
                          border: '1px solid',
                          borderColor: copiedCode === coupon.code ? '#86efac' : '#fed7aa',
                          '&:hover': { bgcolor: '#fff7ed' },
                        }}
                      >
                        {copiedCode === coupon.code ? 'Copied!' : 'Copy Code'}
                      </Button>
                    </Box>
                  </Card>
                )
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* 3. RIGHT SIDEBAR */}
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

      <Drawer
        anchor="right"
        open={mobileCartOpen}
        onClose={() => setMobileCartOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 380 } } }}
      >
        <CartSidebar onClose={() => setMobileCartOpen(false)} isDrawer />
      </Drawer>

      {/* Floating Bottom Cart Bar */}
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
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} added
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Rs {cart.subtotal} →
          </Typography>
        </Box>
      )}

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', fontWeight: 700, borderRadius: '12px' }}>
          Coupon code copied! Paste it at checkout to claim your discount.
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default function OffersPage() {
  return (
    <Suspense fallback={<Box sx={{ p: 4 }}><Skeleton variant="rounded" height={60} /></Box>}>
      <OffersContent />
    </Suspense>
  )
}
