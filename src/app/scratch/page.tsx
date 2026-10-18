'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Stack,
  Chip,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import ShieldIcon from '@mui/icons-material/Shield'

import { ScratchCard } from '@/components/scratch/scratch-card'
import Navbar from '@/components/common/navbar'

interface ScratchData {
  restaurant: {
    id: string
    name: string
    description?: string
    address?: string
    city?: string
    imageUrl?: string
  }
  coupon: {
    code: string
    description?: string
    discountType: 'PERCENTAGE' | 'FLAT'
    discountValue: number
    minOrderAmount: number
    maxDiscount?: number | null
    expiresAt?: string | null
  }
  qr?: {
    id: string
    color: string
    label: string
  } | null
}

function ScratchCardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const qrIdParam = searchParams.get('qrId')
  const couponParam = searchParams.get('coupon')
  const restaurantIdParam = searchParams.get('restaurantId')

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ScratchData | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)

    const query = new URLSearchParams()
    if (qrIdParam) query.set('qrId', qrIdParam)
    if (couponParam) query.set('coupon', couponParam)
    if (restaurantIdParam) query.set('restaurantId', restaurantIdParam)

    fetch(`/api/scratch?${query.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (active && resData.success) {
          setData(resData)
        }
      })
      .catch((err) => {
        console.error('Failed to load scratch data:', err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [qrIdParam, couponParam, restaurantIdParam])

  const handleOrderNow = () => {
    if (!data) return
    const code = data.coupon.code
    const restaurantId = data.restaurant.id

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dine_applied_coupon', code)
      }
    } catch {
      // ignore
    }

    // Direct user to restaurant menu with coupon in URL
    router.push(`/home?restaurantId=${encodeURIComponent(restaurantId)}&coupon=${encodeURIComponent(code)}`)
  }

  const effectiveCouponCode = data?.coupon?.code || couponParam || 'LUCKY20'
  const effectiveDiscountType = data?.coupon?.discountType || 'PERCENTAGE'
  const effectiveDiscountValue = data?.coupon?.discountValue || 20
  const effectiveMinOrder = data?.coupon?.minOrderAmount || 0
  const effectiveRestaurantName = data?.restaurant?.name || 'DineDirect Partner Restaurant'

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 5 }, px: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Top Restaurant Header */}
        <Box sx={{ textAlign: 'center', mb: 3, width: '100%' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#ffffff', px: 2, py: 0.8, borderRadius: '24px', border: '1px solid #e2e8f0', mb: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <StorefrontIcon sx={{ fontSize: 16, color: '#ea580c' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {loading ? 'Finding restaurant...' : effectiveRestaurantName}
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
            Lucky Scratch & Win
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 380, mx: 'auto' }}>
            Scratch off the golden foil below to reveal your secret dining discount coupon!
          </Typography>
        </Box>

        {/* Scratch Card Component Card */}
        {loading ? (
          <Skeleton
            variant="rectangular"
            width={340}
            height={380}
            sx={{ borderRadius: '20px', mb: 3 }}
          />
        ) : (
          <Box sx={{ mb: 3, width: '100%' }}>
            <ScratchCard
              couponCode={effectiveCouponCode}
              discountType={effectiveDiscountType}
              discountValue={effectiveDiscountValue}
              description={data?.coupon?.description}
              minOrderAmount={effectiveMinOrder}
              restaurantName={effectiveRestaurantName}
              restaurantId={data?.restaurant?.id}
              onOrderNow={handleOrderNow}
              onRevealed={() => {
                setToastMessage(`🎉 Awesome! You uncovered code ${effectiveCouponCode}!`)
                setToastOpen(true)
              }}
            />
          </Box>
        )}

        {/* Instructions & Features */}
        <Card
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 360,
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <ShieldIcon sx={{ fontSize: 18, color: '#16a34a' }} />
            How to Redeem Your Coupon
          </Typography>

          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
              <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#ffedd5', color: '#ea580c', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.2 }}>
                1
              </Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
                <strong>Scratch with finger</strong> or cursor until the hidden coupon code is revealed.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
              <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#ffedd5', color: '#ea580c', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.2 }}>
                2
              </Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
                Click <strong>Copy</strong> or <strong>Order Now</strong> to automatically apply your coupon.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
              <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#ffedd5', color: '#ea580c', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.2 }}>
                3
              </Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
                Paste or select the code at checkout to enjoy instant savings on your meal!
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Back Link */}
        <Button
          component={Link}
          href={data?.restaurant?.id ? `/home?restaurantId=${encodeURIComponent(data.restaurant.id)}` : '/home'}
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          sx={{
            borderRadius: '10px',
            color: '#64748b',
            borderColor: '#cbd5e1',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
          }}
        >
          Explore Restaurant Menu
        </Button>
      </Container>

      {/* Snackbar feedback */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: '100%', fontWeight: 700 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default function ScratchPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Loading Scratch & Win...
          </Typography>
        </Box>
      }
    >
      <ScratchCardContent />
    </Suspense>
  )
}
