'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Drawer,
  Typography,
  Grid,
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
import { CustomerSidebar } from '@/components/customer/customer-sidebar'
import { CustomerHeader } from '@/components/customer/customer-header'
import { CartSidebar } from '@/components/customer/cart-sidebar'

import { useAppSelector } from '@/store/hooks'
import { useHistoryModal } from '@/hooks/use-history-modal'

interface OfferDeal {
  code: string
  title: string
  description: string
  minOrder: number
  maxDiscount?: number
  discountLabel: string
  tag: string
  expiry: string
  color: string
}

const DEALS: OfferDeal[] = [
  {
    code: 'WELCOME50',
    title: 'First Order Special',
    description: 'Get flat ₹50 OFF on your first dining or delivery order across all restaurants.',
    minOrder: 199,
    discountLabel: '₹50 OFF',
    tag: 'NEW USER',
    expiry: 'Valid till month end',
    color: '#ea580c',
  },
  {
    code: 'FEAST20',
    title: 'Mega Feast Discount',
    description: 'Enjoy 20% OFF on gourmet combos, thalis, and party orders.',
    minOrder: 399,
    maxDiscount: 120,
    discountLabel: '20% OFF',
    tag: 'POPULAR',
    expiry: 'Expires in 5 days',
    color: '#0284c7',
  },
  {
    code: 'FREEDEL',
    title: 'Zero Delivery Fee',
    description: 'Free doorstep delivery from your favorite neighborhood kitchens.',
    minOrder: 249,
    discountLabel: 'FREE DELIVERY',
    tag: 'DELIVERY',
    expiry: 'Valid today only',
    color: '#16a34a',
  },
  {
    code: 'WEEKEND30',
    title: 'Weekend Binge Treat',
    description: 'Flat 30% discount on all dine-in and online orders placed on weekends.',
    minOrder: 499,
    maxDiscount: 150,
    discountLabel: '30% OFF',
    tag: 'WEEKEND',
    expiry: 'Fri, Sat, Sun',
    color: '#9333ea',
  },
  {
    code: 'SWEETTREAT',
    title: 'Complimentary Sweet / Beverage',
    description: 'Get free dessert with any chef special order above ₹349.',
    minOrder: 349,
    discountLabel: 'FREE DESSERT',
    tag: 'DINE-IN',
    expiry: 'Valid all week',
    color: '#e11d48',
  },
]

function OffersContent() {
  const router = useRouter()
  const cart = useAppSelector((state) => state.cart)

  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)

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

          {/* Deals Grid */}
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            Available Coupons ({DEALS.length})
          </Typography>

          <Grid container spacing={3}>
            {DEALS.map((deal) => (
              <Grid item xs={12} sm={6} md={6} lg={6} key={deal.code}>
                <Card
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
                      borderColor: deal.color,
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 24px -8px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Chip
                        label={deal.tag}
                        size="small"
                        sx={{
                          bgcolor: `${deal.color}15`,
                          color: deal.color,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 13 }} />
                        {deal.expiry}
                      </Typography>
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 800, color: deal.color, mb: 0.5 }}>
                      {deal.discountLabel}
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                      {deal.title}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.86rem', mb: 2, lineHeight: 1.4 }}>
                      {deal.description}
                    </Typography>
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
                        CODE
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em' }}>
                        {deal.code}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      onClick={() => handleCopyCode(deal.code)}
                      startIcon={copiedCode === deal.code ? <CheckCircleIcon /> : <ContentCopyIcon />}
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: copiedCode === deal.code ? '#dcfce7' : '#ffffff',
                        color: copiedCode === deal.code ? '#15803d' : '#ea580c',
                        border: '1px solid',
                        borderColor: copiedCode === deal.code ? '#86efac' : '#fed7aa',
                        '&:hover': { bgcolor: '#fff7ed' },
                      }}
                    >
                      {copiedCode === deal.code ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
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
