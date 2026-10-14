'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Paper,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PercentIcon from '@mui/icons-material/Percent'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import StorefrontIcon from '@mui/icons-material/Storefront'

import Navbar from '@/components/common/navbar'
import { useAppSelector } from '@/store/hooks'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsOwner,
  selectAuthInitialized,
} from '@/store/selectors/auth-selectors'
import { RestaurantCoupon } from '@/data/coupon-manager'
import { apiClient } from '@/utils/api-client'

export default function OwnerCouponsPage() {
  const router = useRouter()
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isOwner = useAppSelector(selectIsOwner)
  const authInitialized = useAppSelector(selectAuthInitialized)

  const [coupons, setCoupons] = useState<RestaurantCoupon[]>([])
  const [restaurantName, setRestaurantName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('199')
  const [maxDiscount, setMaxDiscount] = useState('100')
  const [formError, setFormError] = useState('')

  // Toast State
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  })

  // Auth Guard
  useEffect(() => {
    if (authInitialized) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (!isOwner) {
        router.push('/')
      }
    }
  }, [authInitialized, isAuthenticated, isOwner, router])

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get<{ success: boolean; coupons: RestaurantCoupon[]; restaurant: { name: string } }>('/api/owner/coupons')
      if (res?.coupons) {
        setCoupons(res.coupons)
        if (res.restaurant?.name) setRestaurantName(res.restaurant.name)
      }
    } catch (err: any) {
      console.error('Failed to load coupons:', err)
      setToast({ open: true, message: err?.message || 'Failed to load coupons', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && isOwner) {
      fetchCoupons()
    }
  }, [isAuthenticated, isOwner])

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!code.trim()) {
      setFormError('Please enter a coupon code (e.g. WELCOME50)')
      return
    }

    const val = Number(discountValue)
    if (!val || val <= 0) {
      setFormError('Please specify a positive discount value')
      return
    }

    if (discountType === 'PERCENTAGE' && val > 90) {
      setFormError('Percentage discount cannot exceed 90%')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiClient.post<{ success: boolean; coupon: RestaurantCoupon }>('/api/owner/coupons', {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue: val,
        minOrderAmount: Number(minOrderAmount || 0),
        maxDiscount: discountType === 'PERCENTAGE' && maxDiscount ? Number(maxDiscount) : undefined,
      })

      if (res?.coupon) {
        setCoupons((prev) => [res.coupon, ...prev])
        setCreateModalOpen(false)
        setCode('')
        setDescription('')
        setDiscountValue('')
        setMinOrderAmount('199')
        setMaxDiscount('100')
        setToast({ open: true, message: `Coupon ${res.coupon.code} created successfully!`, severity: 'success' })
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create coupon')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (coupon: RestaurantCoupon) => {
    try {
      const newStatus = !coupon.isActive
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, isActive: newStatus } : c)))

      await apiClient.patch('/api/owner/coupons', {
        id: coupon.id,
        isActive: newStatus,
      })

      setToast({
        open: true,
        message: `Coupon ${coupon.code} is now ${newStatus ? 'Active' : 'Inactive'}`,
        severity: 'info',
      })
    } catch (err: any) {
      fetchCoupons()
      setToast({ open: true, message: 'Failed to update coupon status', severity: 'error' })
    }
  }

  const handleDeleteCoupon = async (couponId: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${couponCode}?`)) return

    try {
      setCoupons((prev) => prev.filter((c) => c.id !== couponId))
      await apiClient.delete(`/api/owner/coupons?id=${encodeURIComponent(couponId)}`)
      setToast({ open: true, message: `Coupon ${couponCode} deleted.`, severity: 'info' })
    } catch (err: any) {
      fetchCoupons()
      setToast({ open: true, message: 'Failed to delete coupon', severity: 'error' })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setToast({ open: true, message: `Coupon code "${text}" copied!`, severity: 'success' })
  }

  // Quick stats
  const activeCouponsCount = coupons.filter((c) => c.isActive).length
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)
  const totalSavings = coupons.reduce(
    (sum, c) => sum + (c.usageCount || 0) * (c.discountType === 'FLAT' ? c.discountValue : 80),
    0
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Header Navigation & Title */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              component={Link}
              href="/owner/dashboard"
              sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f1f5f9' } }}
            >
              <ArrowBackIcon sx={{ color: '#1e293b' }} />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Coupons & Offers Studio
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Create promotional discount codes and special deals for {restaurantName || 'your restaurant'}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={() => setCreateModalOpen(true)}
            startIcon={<AddIcon />}
            sx={{
              bgcolor: '#ea580c',
              '&:hover': { bgcolor: '#c2410c' },
              fontWeight: 800,
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(234, 88, 12, 0.3)',
            }}
          >
            Create New Offer
          </Button>
        </Box>

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2.5, mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#fff7ed', color: '#ea580c' }}>
                <LocalOfferIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                Active Offers
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
              {activeCouponsCount} <Typography component="span" variant="caption" sx={{ color: '#94a3b8' }}>/ {coupons.length}</Typography>
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#f0fdf4', color: '#16a34a' }}>
                <TrendingUpIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                Total Redeemed
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
              {totalRedemptions} times
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#eef2ff', color: '#4338ca' }}>
                <PeopleAltOutlinedIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                Customer Savings
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
              ₹{totalSavings.toLocaleString('en-IN')}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#fdf2f8', color: '#db2777' }}>
                <StorefrontIcon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                Avg. Deal Size
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
              20% - 25%
            </Typography>
          </Paper>
        </Box>

        {/* Coupon Cards Grid */}
        {loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#ea580c' }} />
          </Box>
        ) : coupons.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: '24px',
              textAlign: 'center',
              border: '2px dashed #cbd5e1',
              bgcolor: '#ffffff',
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: '#fff7ed',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LocalOfferIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              No coupons created yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3, maxWidth: 400, mx: 'auto' }}>
              Create your first promotional coupon to boost customer orders and drive repeat diners.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setCreateModalOpen(true)}
              sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' }, borderRadius: '12px', fontWeight: 700, px: 3 }}
            >
              Create First Offer
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {coupons.map((coupon) => {
              const isPercent = coupon.discountType === 'PERCENTAGE'

              return (
                <Card
                  key={coupon.id}
                    elevation={0}
                    sx={{
                      borderRadius: '20px',
                      border: '1.5px solid',
                      borderColor: coupon.isActive ? '#e2e8f0' : '#f1f5f9',
                      bgcolor: '#ffffff',
                      opacity: coupon.isActive ? 1 : 0.75,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 28px -6px rgba(0,0,0,0.08)',
                        borderColor: coupon.isActive ? '#ea580c' : '#cbd5e1',
                      },
                    }}
                  >
                    {/* Top colored strip */}
                    <Box
                      sx={{
                        p: 2.5,
                        background: coupon.isActive
                          ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
                          : '#f8fafc',
                        borderBottom: '1px dashed #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            bgcolor: coupon.isActive ? '#ea580c' : '#94a3b8',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          }}
                        >
                          {isPercent ? <PercentIcon sx={{ fontSize: 22 }} /> : <CurrencyRupeeIcon sx={{ fontSize: 22 }} />}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                            {isPercent ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                            {isPercent && coupon.maxDiscount ? `Up to ₹${coupon.maxDiscount}` : 'Flat Discount'}
                          </Typography>
                        </Box>
                      </Box>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={coupon.isActive}
                            onChange={() => handleToggleActive(coupon)}
                            color="success"
                            size="small"
                          />
                        }
                        label={coupon.isActive ? 'Active' : 'Inactive'}
                        labelPlacement="start"
                        sx={{
                          m: 0,
                          '& .MuiTypography-root': {
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: coupon.isActive ? '#16a34a' : '#94a3b8',
                            mr: 0.8,
                          },
                        }}
                      />
                    </Box>

                    {/* Card Body */}
                    <Box sx={{ p: 2.5 }}>
                      {/* Coupon Code Pill with Copy */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '10px',
                          p: 1.2,
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 900,
                            color: '#ea580c',
                            fontFamily: 'monospace',
                            letterSpacing: '0.05em',
                            fontSize: '0.98rem',
                          }}
                        >
                          {coupon.code}
                        </Typography>
                        <Tooltip title="Copy Code">
                          <IconButton size="small" onClick={() => copyToClipboard(coupon.code)}>
                            <ContentCopyIcon sx={{ fontSize: 16, color: '#64748b' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, mb: 2, minHeight: 40, lineHeight: 1.4 }}>
                        {coupon.description}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip
                          label={`Min Order: ₹${coupon.minOrderAmount}`}
                          size="small"
                          sx={{ bgcolor: '#f1f5f9', fontWeight: 700, color: '#475569', fontSize: '0.72rem' }}
                        />
                        <Chip
                          label={`Redeemed ${coupon.usageCount || 0}x`}
                          size="small"
                          sx={{ bgcolor: '#f0fdf4', fontWeight: 700, color: '#16a34a', fontSize: '0.72rem' }}
                        />
                      </Stack>

                      {/* Card Footer Actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                          Created: {new Date(coupon.createdAt).toLocaleDateString()}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#dc2626', bgcolor: '#fef2f2' } }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
              )
            })}
          </Box>
        )}
      </Container>

      {/* Create Coupon Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocalOfferIcon sx={{ color: '#ea580c' }} />
          Create New Offer / Coupon
        </DialogTitle>

        <Box component="form" onSubmit={handleCreateCoupon}>
          <DialogContent dividers>
            {formError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }} onClose={() => setFormError('')}>
                {formError}
              </Alert>
            )}

            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mb: 0.5, display: 'block' }}>
                  Coupon Code (e.g. WELCOME50)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. FESTIVE20, FLAT100"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {['WELCOME50', 'FEAST20', 'FLAT100', 'SUPER25'].map((sug) => (
                    <Chip
                      key={sug}
                      label={sug}
                      size="small"
                      clickable
                      onClick={() => setCode(sug)}
                      sx={{ fontWeight: 700, bgcolor: '#f1f5f9', fontSize: '0.72rem' }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mb: 0.5, display: 'block' }}>
                  Offer Description
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. Get 20% OFF on all dinner orders above ₹400"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mb: 0.5, display: 'block' }}>
                  Discount Type
                </Typography>
                <RadioGroup
                  row
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                >
                  <FormControlLabel
                    value="PERCENTAGE"
                    control={<Radio sx={{ '&.Mui-checked': { color: '#ea580c' } }} />}
                    label="Percentage Discount (%)"
                    sx={{ '& .MuiTypography-root': { fontWeight: 700, fontSize: '0.9rem' } }}
                  />
                  <FormControlLabel
                    value="FLAT"
                    control={<Radio sx={{ '&.Mui-checked': { color: '#ea580c' } }} />}
                    label="Flat Rupees Off (₹)"
                    sx={{ '& .MuiTypography-root': { fontWeight: 700, fontSize: '0.9rem' } }}
                  />
                </RadioGroup>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mb: 0.5, display: 'block' }}>
                    {discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder={discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 50'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mb: 0.5, display: 'block' }}>
                    Min. Order Amount (₹)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="e.g. 199"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                  />
                </Box>
              </Box>

              {discountType === 'PERCENTAGE' && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mb: 0.5, display: 'block' }}>
                    Max Discount Cap (₹) (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="e.g. 150"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                  />
                </Box>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateModalOpen(false)} sx={{ fontWeight: 700, color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                bgcolor: '#ea580c',
                '&:hover': { bgcolor: '#c2410c' },
                fontWeight: 800,
                borderRadius: '10px',
                px: 3,
              }}
            >
              {submitting ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : 'Publish Offer'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} sx={{ borderRadius: '12px', fontWeight: 700 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
