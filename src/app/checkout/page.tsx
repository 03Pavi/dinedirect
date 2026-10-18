'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Divider,
  Stack,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  RadioGroup,
  Radio,
  FormControlLabel,
  IconButton,
  Tooltip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant'
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import RestaurantIcon from '@mui/icons-material/Restaurant'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { DeliveryAddressMap } from '@/components/customer/delivery-address-map'
import { updateQuantity, removeItem, clearCart, setCartTable } from '@/store/slices/cart-slice'
import { selectCurrentUser, selectIsAuthenticated } from '@/store/selectors/auth-selectors'
import { apiClient } from '@/utils/api-client'
import { formatPrice } from '@/utils/format-price'

interface TableOption {
  id: string
  tableNumber: string
  label: string
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableParam = searchParams.get('table')
  const qrIdParam = searchParams.get('qrId')
  const dispatch = useAppDispatch()

  const cart = useAppSelector((state) => state.cart)
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  // Order Details State
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN')
  const [tableNumber, setTableNumber] = useState(tableParam || cart.tableNumber || '')
  const [availableTables, setAvailableTables] = useState<TableOption[]>([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Sync URL table params if provided
  useEffect(() => {
    if (tableParam) {
      setTableNumber(tableParam)
      dispatch(setCartTable({ tableNumber: tableParam, qrId: qrIdParam || undefined }))
    } else if (cart.tableNumber) {
      setTableNumber(cart.tableNumber)
    }
  }, [tableParam, qrIdParam, cart.tableNumber, dispatch])

  // Fetch dynamic tables from DB for current restaurant
  useEffect(() => {
    if (!cart.restaurantId) return
    let active = true
    setLoadingTables(true)
    apiClient
      .get<{ tables: TableOption[] }>(`/api/qr/tables?restaurantId=${encodeURIComponent(cart.restaurantId)}`)
      .then((res) => {
        if (active && res?.tables) {
          setAvailableTables(res.tables)
          if (!tableNumber && !cart.tableNumber && res.tables.length > 0) {
            setTableNumber(res.tables[0].tableNumber)
            dispatch(setCartTable({ tableNumber: res.tables[0].tableNumber }))
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load restaurant tables from DB', err)
      })
      .finally(() => {
        if (active) setLoadingTables(false)
      })

    return () => {
      active = false
    }
  }, [cart.restaurantId, cart.tableNumber, tableNumber, dispatch])

  const handleSelectTable = (tbl: string) => {
    setTableNumber(tbl)
    dispatch(setCartTable({ tableNumber: tbl }))
  }
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [kitchenNote, setKitchenNote] = useState('')
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD'>('CASH')

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState('')

  // Submission State
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  // Prefill user data if authenticated
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name)
      if (user.phone) setCustomerPhone(user.phone)
    }
  }, [user])

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.05) // 5% GST
  const discount = appliedCoupon ? appliedCoupon.discount : 0
  const finalTotal = Math.max(0, subtotal + tax - discount)

  const [restaurantCoupons, setRestaurantCoupons] = useState<any[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const activeRestaurantId = cart.restaurantId || (cart.items[0] as any)?.restaurantId || null

  // Load restaurant's exact active coupons
  useEffect(() => {
    if (activeRestaurantId) {
      setLoadingCoupons(true)
      apiClient
        .get<{ coupons: any[] }>(`/api/coupons/validate?restaurantId=${encodeURIComponent(activeRestaurantId)}`)
        .then((res) => {
          if (res?.coupons && Array.isArray(res.coupons)) {
            setRestaurantCoupons(res.coupons)
          } else {
            setRestaurantCoupons([])
          }
        })
        .catch(() => {
          setRestaurantCoupons([])
        })
        .finally(() => {
          setLoadingCoupons(false)
        })
    } else {
      setRestaurantCoupons([])
      setLoadingCoupons(false)
    }
  }, [activeRestaurantId])

  // Pre-fill scratched coupon code from searchParams or localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !appliedCoupon) {
        const queryCode = searchParams.get('coupon')
        const savedCode = localStorage.getItem('dine_applied_coupon')
        const code = (queryCode || savedCode || '').trim().toUpperCase()
        if (code && !couponCode) {
          setCouponCode(code)
        }
      }
    } catch {}
  }, [searchParams, appliedCoupon, couponCode])

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase()
    setCouponError('')

    if (!code) {
      setCouponError('Please enter a coupon code')
      return
    }

    if (!activeRestaurantId) {
      setCouponError('Restaurant details are missing from your order.')
      return
    }

    setApplyingCoupon(true)
    try {
      const res = await apiClient.post<{ valid: boolean; discount: number; message: string }>('/api/coupons/validate', {
        restaurantId: activeRestaurantId,
        code,
        subtotal,
      })

      if (res?.valid) {
        setAppliedCoupon({ code, discount: res.discount })
        setCouponCode(code)
      } else {
        setCouponError(res?.message || 'Invalid coupon code')
      }
    } catch (err: any) {
      setCouponError(err?.message || 'Invalid or expired coupon code')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handlePlaceOrder = async () => {
    setErrorMessage('')

    if (!cart.restaurantId || cart.items.length === 0) {
      setErrorMessage('Your cart is empty.')
      return
    }

    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      setErrorMessage('Please specify your table number for Dine-In.')
      return
    }

    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      setErrorMessage('Please provide a delivery address.')
      return
    }

    setIsPlacingOrder(true)

    try {
      const computedAddress =
        orderType === 'DINE_IN'
          ? `${tableNumber} / Dine-In`
          : orderType === 'TAKEAWAY'
          ? 'Takeaway / Self-Pickup'
          : deliveryAddress

      const payload = {
        restaurantId: cart.restaurantId,
        items: cart.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        address: computedAddress,
        note: kitchenNote || null,
        paymentMode,
        orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber : null,
        subtotal,
        discount,
        couponCode: appliedCoupon?.code || null,
      }

      const res = await apiClient.post<{ success: boolean; order: { id: string } }>('/api/orders', payload)

      if (res?.order?.id) {
        setOrderSuccess({ orderId: res.order.id })
        dispatch(clearCart())
      } else {
        throw new Error('Order placement succeeded without an order ID.')
      }
    } catch (err: any) {
      console.error('Failed to place order:', err)
      setErrorMessage(err?.response?.data?.error || err?.message || 'Failed to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // Success Screen
  if (orderSuccess) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 4, sm: 8 } }}>
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: '24px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#ecfdf5',
                color: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 48 }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Order Confirmed!
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              Your order has been sent directly to the kitchen.
            </Typography>

            <Box
              sx={{
                bgcolor: '#f1f5f9',
                p: 2.5,
                borderRadius: '16px',
                mb: 3,
                textAlign: 'left',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Order ID</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                  #{orderSuccess.orderId.slice(0, 8).toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Estimated Prep Time</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#ea580c' }}>
                  15 - 20 mins
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Payment Mode</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {paymentMode}
                </Typography>
              </Box>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push('/')}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderColor: '#cbd5e1',
                  color: '#475569',
                }}
              >
                Back to Home
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  if (cart.restaurantId) {
                    router.push(`/home?restaurantId=${cart.restaurantId}`)
                  } else {
                    router.push('/home')
                  }
                }}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: '#ea580c',
                  '&:hover': { bgcolor: '#c2410c' },
                }}
              >
                View Menu / Order More
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    )
  }

  // Empty Cart State
  if (cart.items.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 4, sm: 8 } }}>
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: '24px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#fff7ed',
                color: '#ea580c',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 44 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3.5, maxWidth: 360, mx: 'auto' }}>
              Explore our menu and add delicious dishes to proceed with checkout and billing.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/')}
              sx={{
                bgcolor: '#ea580c',
                '&:hover': { bgcolor: '#c2410c' },
                borderRadius: '12px',
                fontWeight: 700,
                px: 4,
                py: 1.4,
                textTransform: 'none',
              }}
            >
              Browse Restaurants & Menu
            </Button>
          </Paper>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 8 }}>
      {/* Top Navigation Bar */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          py: 2,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => router.back()}
                sx={{
                  bgcolor: '#f1f5f9',
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
              >
                <ArrowBackIcon sx={{ color: '#1e293b' }} />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Checkout & Billing
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <RestaurantIcon sx={{ fontSize: 13, color: '#ea580c' }} />
                  {cart.restaurantName || 'Restaurant Order'}
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<LockOutlinedIcon sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />}
              label="100% Secure Checkout"
              size="small"
              sx={{
                bgcolor: '#ecfdf5',
                color: '#065f46',
                fontWeight: 700,
                borderRadius: '8px',
                display: { xs: 'none', sm: 'flex' },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Main Checkout Grid */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
            gap: 3.5,
            alignItems: 'start',
          }}
        >
          {/* Left Column: Dining Options & Customer Info */}
          <Stack spacing={3}>
            {/* 1. Dining Preference */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                1. Order Preference
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 3 }}>
                {[
                  { type: 'DINE_IN', label: 'Dine-In', icon: TableRestaurantIcon },
                  { type: 'TAKEAWAY', label: 'Takeaway', icon: TakeoutDiningIcon },
                  { type: 'DELIVERY', label: 'Delivery', icon: DeliveryDiningIcon },
                ].map((opt) => {
                  const isSelected = orderType === opt.type
                  const Icon = opt.icon
                  return (
                    <Box
                      key={opt.type}
                      onClick={() => setOrderType(opt.type as any)}
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        border: '2px solid',
                        borderColor: isSelected ? '#ea580c' : '#f1f5f9',
                        bgcolor: isSelected ? '#fff7ed' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: '#fed7aa' },
                      }}
                    >
                      <Icon sx={{ color: isSelected ? '#ea580c' : '#64748b', fontSize: 28, mb: 0.5 }} />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: isSelected ? '#ea580c' : '#1e293b' }}
                      >
                        {opt.label}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>

              {/* Dine-In Table Selection */}
              {orderType === 'DINE_IN' && (
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      Select or Enter Table Number
                    </Typography>
                    {loadingTables && (
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Loading tables...
                      </Typography>
                    )}
                  </Box>

                  {availableTables.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                      {availableTables.map((tbl) => {
                        const isSelected = tableNumber.toLowerCase() === tbl.tableNumber.toLowerCase()
                        return (
                          <Chip
                            key={tbl.id}
                            label={tbl.tableNumber}
                            clickable
                            onClick={() => handleSelectTable(tbl.tableNumber)}
                            sx={{
                              fontWeight: 700,
                              bgcolor: isSelected ? '#ea580c' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#334155',
                              border: '1px solid',
                              borderColor: isSelected ? '#ea580c' : '#cbd5e1',
                              '&:hover': {
                                bgcolor: isSelected ? '#c2410c' : '#f1f5f9',
                              },
                            }}
                          />
                        )
                      })}
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    size="small"
                    value={tableNumber}
                    onChange={(e) => handleSelectTable(e.target.value)}
                    placeholder="e.g. Table 4 or Table A"
                    sx={{ bgcolor: '#ffffff' }}
                  />
                </Box>
              )}

              {/* Delivery Address Input & Online Map Marker */}
              {orderType === 'DELIVERY' && (
                <DeliveryAddressMap
                  value={deliveryAddress}
                  onChange={setDeliveryAddress}
                />
              )}
            </Paper>

            {/* 2. Customer & Contact Details */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                2. Contact Information
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 0.5, display: 'block' }}>
                      Customer Name
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. Alex Smith"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 0.5, display: 'block' }}>
                      Phone Number
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. +91 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 0.5, display: 'block' }}>
                    Special Cooking / Kitchen Instructions (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    value={kitchenNote}
                    onChange={(e) => setKitchenNote(e.target.value)}
                    placeholder="e.g. Extra napkins, less spicy, no onion..."
                  />
                </Box>
              </Stack>
            </Paper>

            {/* 3. Payment Mode */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                3. Payment Method
              </Typography>

              <RadioGroup value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as any)}>
                <Stack spacing={1.5}>
                  {[
                    {
                      value: 'CASH',
                      label: 'Cash on Counter / Pay at Table',
                      desc: 'Pay directly in cash when served or at billing desk',
                      icon: PaymentsOutlinedIcon,
                    },
                    {
                      value: 'UPI',
                      label: 'UPI / Scan & Pay',
                      desc: 'Pay using Google Pay, PhonePe, Paytm QR',
                      icon: QrCode2Icon,
                    },
                    {
                      value: 'CARD',
                      label: 'Credit / Debit Card',
                      desc: 'Card swipe at table or POS terminal',
                      icon: CreditCardIcon,
                    },
                  ].map((method) => {
                    const isSelected = paymentMode === method.value
                    const Icon = method.icon
                    return (
                      <Box
                        key={method.value}
                        onClick={() => setPaymentMode(method.value as any)}
                        sx={{
                          p: 2,
                          borderRadius: '14px',
                          border: '2px solid',
                          borderColor: isSelected ? '#ea580c' : '#f1f5f9',
                          bgcolor: isSelected ? '#fff7ed' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Icon sx={{ color: isSelected ? '#ea580c' : '#64748b' }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                              {method.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {method.desc}
                            </Typography>
                          </Box>
                        </Box>
                        <Radio
                          checked={isSelected}
                          sx={{
                            color: '#cbd5e1',
                            '&.Mui-checked': { color: '#ea580c' },
                          }}
                        />
                      </Box>
                    )
                  })}
                </Stack>
              </RadioGroup>
            </Paper>
          </Stack>

          {/* Right Column: Order Items, Coupons & Final Billing Breakdown */}
          <Stack spacing={3}>
            {/* Items Summary Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Items in Cart
                </Typography>
                <Chip
                  label={`${cart.items.reduce((s, i) => s + i.quantity, 0)} items`}
                  size="small"
                  sx={{ bgcolor: '#f1f5f9', fontWeight: 700, color: '#475569' }}
                />
              </Box>

              <Stack spacing={2} divider={<Divider />}>
                {cart.items.map((item) => (
                  <Box key={item.menuItemId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0, pr: 1 }}>
                      {/* Veg / Non-veg dot indicator */}
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          border: `1.5px solid ${item.isVeg ? '#16a34a' : '#dc2626'}`,
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            bgcolor: item.isVeg ? '#16a34a' : '#dc2626',
                            borderRadius: '50%',
                          }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }} noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {formatPrice(item.price)} each
                        </Typography>
                      </Box>
                    </Box>

                    {/* Quantity Stepper */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: '#f1f5f9',
                          borderRadius: '8px',
                          p: 0.3,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (item.quantity > 1) {
                              dispatch(updateQuantity({ menuItemId: item.menuItemId, quantity: item.quantity - 1 }))
                            } else {
                              dispatch(removeItem(item.menuItemId))
                            }
                          }}
                          sx={{ p: 0.5, color: '#475569' }}
                        >
                          {item.quantity === 1 ? <DeleteOutlineIcon sx={{ fontSize: 16 }} /> : <RemoveIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 700, px: 1, minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => dispatch(updateQuantity({ menuItemId: item.menuItemId, quantity: item.quantity + 1 }))}
                          sx={{ p: 0.5, color: '#475569' }}
                        >
                          <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', minWidth: 60, textAlign: 'right' }}>
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Coupons Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferOutlinedIcon sx={{ color: '#ea580c', fontSize: 18 }} />
                Offers & Coupons
              </Typography>

              {appliedCoupon ? (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: '#ecfdf5',
                    borderRadius: '12px',
                    border: '1px dashed #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#065f46' }}>
                      {appliedCoupon.code} Applied
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#047857' }}>
                      You saved {formatPrice(appliedCoupon.discount)}!
                    </Typography>
                  </Box>
                  <Button size="small" color="error" onClick={handleRemoveCoupon} sx={{ fontWeight: 700, textTransform: 'none' }}>
                    Remove
                  </Button>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleApplyCoupon()}
                      disabled={applyingCoupon}
                      sx={{
                        bgcolor: '#0f172a',
                        '&:hover': { bgcolor: '#1e293b' },
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 2.5,
                        borderRadius: '8px',
                      }}
                    >
                      {applyingCoupon ? <CircularProgress size={16} color="inherit" /> : 'Apply'}
                    </Button>
                  </Box>

                  {couponError && (
                    <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                      {couponError}
                    </Typography>
                  )}

                  {/* Exact restaurant coupons provided by the restaurant */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 0.5, alignItems: 'center' }}>
                    {loadingCoupons ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <CircularProgress size={14} sx={{ color: '#ea580c' }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                          Fetching restaurant offers...
                        </Typography>
                      </Box>
                    ) : restaurantCoupons.length > 0 ? (
                      restaurantCoupons.map((cpn: any) => {
                        const meetsMin = subtotal >= (cpn.minOrderAmount || 0)
                        return (
                          <Tooltip
                            key={cpn.id}
                            title={
                              cpn.minOrderAmount > 0
                                ? `Min order: ₹${cpn.minOrderAmount}${!meetsMin ? ` (Add ₹${cpn.minOrderAmount - subtotal} more)` : ' - Ready to apply'}`
                                : (cpn.description || 'Click to apply')
                            }
                            arrow
                          >
                            <span>
                              <Chip
                                label={`${cpn.code} (${cpn.discountType === 'PERCENTAGE' ? `${cpn.discountValue}% OFF` : `₹${cpn.discountValue} OFF`})`}
                                clickable
                                size="small"
                                disabled={applyingCoupon}
                                onClick={() => handleApplyCoupon(cpn.code)}
                                sx={{
                                  bgcolor: meetsMin ? '#fff7ed' : '#f8fafc',
                                  color: meetsMin ? '#ea580c' : '#94a3b8',
                                  fontWeight: 700,
                                  border: meetsMin ? '1px dashed #ea580c' : '1px dashed #cbd5e1',
                                  cursor: meetsMin ? 'pointer' : 'default',
                                  '&:hover': meetsMin ? { bgcolor: '#ffedd5' } : {},
                                }}
                              />
                            </span>
                          </Tooltip>
                        )
                      })
                    ) : (
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 500 }}>
                        No offers available for this restaurant
                      </Typography>
                    )}
                  </Box>
                </Stack>
              )}
            </Paper>

            {/* Bill Summary Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                Bill Details
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Item Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>GST & Restaurant Taxes (5%)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(tax)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Convenience & Service Fee</Typography>
                  <Chip label="FREE" size="small" sx={{ bgcolor: '#ecfdf5', color: '#065f46', fontWeight: 800, height: 20 }} />
                </Box>
                {discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 700 }}>Coupon Discount</Typography>
                    <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 700 }}>-{formatPrice(discount)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    To Pay
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#ea580c' }}>
                    {formatPrice(finalTotal)}
                  </Typography>
                </Box>
              </Stack>

              {/* Submit Order Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={isPlacingOrder}
                onClick={handlePlaceOrder}
                sx={{
                  bgcolor: '#ea580c',
                  color: '#ffffff',
                  py: 1.8,
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(234, 88, 12, 0.35)',
                  '&:hover': {
                    bgcolor: '#c2410c',
                    boxShadow: '0 12px 28px rgba(234, 88, 12, 0.45)',
                  },
                }}
              >
                {isPlacingOrder ? (
                  <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                ) : (
                  `Place Order • ${formatPrice(finalTotal)}`
                )}
              </Button>
            </Paper>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#ea580c' }} />
        </Box>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
