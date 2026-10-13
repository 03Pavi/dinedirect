'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  IconButton,
  Divider,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateQuantity, removeItem, clearCart } from '@/store/slices/cart-slice'
import { CartItem } from '@/types/order-types'

interface CustomerCartPanelProps {
  onCloseMobile?: () => void
}

export function CustomerCartPanel({ onCloseMobile }: CustomerCartPanelProps) {
  const dispatch = useAppDispatch()
  const cart = useAppSelector((state) => state.cart)

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  const handleQuantityChange = (menuItemId: string, newQty: number) => {
    if (newQty <= 0) {
      dispatch(removeItem(menuItemId))
    } else {
      dispatch(updateQuantity({ menuItemId, quantity: newQty }))
    }
  }

  const handleApplyCoupon = () => {
    setCouponError(null)
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setCouponError('Please enter a coupon code')
      return
    }

    if (code === 'WELCOME50' || code === 'JUMBO' || code === 'FEAST20' || code === 'A2BSUPER') {
      const discount = code === 'WELCOME50' ? Math.min(cart.subtotal * 0.5, 150) : 50
      setAppliedCoupon(code)
      setDiscountAmount(discount)
      setCouponCode('')
    } else {
      setCouponError('Invalid code. Try "WELCOME50" or "JUMBO"')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
  }

  const deliveryFee = cart.items.length > 0 ? (cart.subtotal > 500 ? 0 : 35) : 0
  const subtotal = cart.subtotal
  const totalToPay = Math.max(0, subtotal + deliveryFee - discountAmount)

  const handleCheckout = () => {
    if (cart.items.length === 0) return
    setCheckoutSuccess(true)
  }

  const handleFinishOrder = () => {
    setCheckoutSuccess(false)
    dispatch(clearCart())
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2.5, md: 3 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}
        >
          Order Menu
        </Typography>
        <Button
          variant="text"
          onClick={() => {
            if (cart.items.length > 0) {
              dispatch(clearCart())
            }
          }}
          sx={{
            color: '#ea580c',
            fontWeight: 700,
            fontSize: '0.85rem',
            p: 0,
            minWidth: 'auto',
            textTransform: 'none',
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          {cart.items.length > 0 ? 'Clear all' : 'See all'}
        </Button>
      </Box>

      {/* Cart Items List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pr: 0.5,
          mb: 2,
          '::-webkit-scrollbar': { width: 4 },
          '::-webkit-scrollbar-thumb': { bgcolor: '#f1f5f9', borderRadius: 4 },
        }}
      >
        {cart.items.length > 0 ? (
          <Stack spacing={2}>
            {cart.items.map((item) => (
              <Box
                key={item.menuItemId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.2,
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    borderColor: '#e2e8f0',
                  },
                }}
              >
                {/* Thumbnail Image */}
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    bgcolor: '#f1f5f9',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.imageUrl ? (
                    <Box
                      component="img"
                      src={item.imageUrl}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <RestaurantIcon sx={{ color: '#cbd5e1', fontSize: 24 }} />
                  )}
                </Box>

                {/* Details */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      fontSize: '0.88rem',
                      lineHeight: 1.2,
                      mb: 0.5,
                    }}
                  >
                    {item.name}
                  </Typography>

                  {/* Quantity selector matching screenshot (× 3 ⌄) */}
                  <Select
                    size="small"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.menuItemId, Number(e.target.value))
                    }
                    sx={{
                      height: 26,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#475569',
                      bgcolor: '#ffffff',
                      borderRadius: '6px',
                      '& .MuiSelect-select': {
                        py: 0.3,
                        px: 1,
                        pr: '22px !important',
                      },
                      '& fieldset': {
                        borderColor: '#e2e8f0',
                      },
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <MenuItem key={num} value={num} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        × {num}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Price & Delete */}
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}
                  >
                    Rs {item.price * item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => dispatch(removeItem(item.menuItemId))}
                    sx={{ p: 0.3, color: '#94a3b8', '&:hover': { color: '#dc2626' } }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              height: '100%',
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 3,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c',
                mb: 1.5,
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
              Your plate is empty
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', maxWidth: 180 }}>
              Click "+ Add" on any dish to start building your order.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Bill & Coupon Section */}
      <Box sx={{ pt: 1, borderTop: '1px solid #f1f5f9' }}>
        {/* Bill Rows */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              Item Total
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
              Rs {subtotal}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              Delivery Fee
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
              {deliveryFee === 0 ? 'FREE' : `Rs ${deliveryFee}`}
            </Typography>
          </Box>

          {appliedCoupon && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Coupon ({appliedCoupon})
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                - Rs {discountAmount}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Promotion Coupon Box (from screenshot) */}
        <Box
          sx={{
            p: 1.2,
            borderRadius: '10px',
            bgcolor: '#fff7ed',
            border: '1px dashed #fed7aa',
            mb: 2,
          }}
        >
          {appliedCoupon ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#15803d' }}>
                  {appliedCoupon} applied (Rs {discountAmount} saved)
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={handleRemoveCoupon}
                sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}
              >
                Remove
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                placeholder="Find Promotion"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  sx: {
                    bgcolor: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    height: 36,
                    '& fieldset': { borderColor: 'transparent' },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleApplyCoupon}
                startIcon={<LocalOfferIcon sx={{ fontSize: 15 }} />}
                sx={{
                  bgcolor: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  height: 36,
                  px: 1.5,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#c2410c' },
                }}
              >
                Add Coupon
              </Button>
            </Box>
          )}
          {couponError && (
            <Typography variant="caption" sx={{ color: '#dc2626', display: 'block', mt: 0.5, fontWeight: 600 }}>
              {couponError}
            </Typography>
          )}
        </Box>

        {/* To Pay Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
            To Pay
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}
          >
            Rs {totalToPay}
          </Typography>
        </Box>

        {/* Bold Orange Checkout Button (from screenshot) */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleCheckout}
          disabled={cart.items.length === 0}
          startIcon={<ShoppingBagIcon />}
          sx={{
            py: 1.4,
            bgcolor: '#ea580c',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.98rem',
            textTransform: 'none',
            borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
            '&:hover': {
              bgcolor: '#c2410c',
            },
            '&.Mui-disabled': {
              bgcolor: '#cbd5e1',
              color: '#ffffff',
            },
          }}
        >
          Checkout
        </Button>
      </Box>

      {/* Checkout Success Modal Dialog */}
      <Dialog
        open={checkoutSuccess}
        onClose={handleFinishOrder}
        PaperProps={{ sx: { borderRadius: '16px', p: 1, textAlign: 'center', maxWidth: 380 } }}
      >
        <DialogTitle sx={{ pt: 3 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Order Placed Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Your kitchen order for <strong>Rs {totalToPay}</strong> has been sent directly to the chefs.
          </Typography>
          <Alert severity="success" sx={{ borderRadius: '8px', fontWeight: 600, textAlign: 'left' }}>
            Order #ORD-{Math.floor(1000 + Math.random() * 9000)} is now Preparing!
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleFinishOrder}
            sx={{ bgcolor: '#ea580c', fontWeight: 700, borderRadius: '8px', px: 4 }}
          >
            Back to Menu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
