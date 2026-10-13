'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Divider,
  Stack,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import StorefrontIcon from '@mui/icons-material/Storefront'
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateQuantity, removeItem, clearCart } from '@/store/slices/cart-slice'
import { selectCurrentUser, selectIsAuthenticated } from '@/store/selectors/auth-selectors'
import { apiClient } from '@/utils/api-client'
import { useHistoryModal } from '@/hooks/use-history-modal'

interface CartSidebarProps {
  onClose?: () => void
  isDrawer?: boolean
}

export function CartSidebar({ onClose, isDrawer = false }: CartSidebarProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const cart = useAppSelector((state) => state.cart)
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [tableNumber, setTableNumber] = useState('Table 1')
  const [orderNote, setOrderNote] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null)
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)

  // Manage back-button history on checkout modal
  useHistoryModal({
    open: checkoutDialogOpen,
    onClose: () => setCheckoutDialogOpen(false),
    modalId: 'checkout-modal',
  })

  const subtotal = cart.subtotal || 0
  const deliveryFee = cart.items.length > 0 ? (cart.deliveryFee || 25) : 0
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0
  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount)

  const handleApplyCoupon = () => {
    setCouponError('')
    const code = couponCode.trim().toUpperCase()
    if (!code) return

    if (code === 'WELCOME50') {
      const discount = Math.min(100, Math.round(subtotal * 0.5))
      setAppliedCoupon({ code, discount })
    } else if (code === 'FEAST20') {
      const discount = Math.round(subtotal * 0.2)
      setAppliedCoupon({ code, discount })
    } else {
      setCouponError('Invalid coupon code. Try WELCOME50 or FEAST20')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    router.push('/checkout')
  }

  const handleConfirmOrder = async () => {
    if (!cart.restaurantId || cart.items.length === 0) return

    setPlacingOrder(true)
    try {
      const payload = {
        restaurantId: cart.restaurantId,
        items: cart.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        address: `${tableNumber} / Dine-In`,
        note: orderNote || null,
        paymentMode: 'CASH',
      }

      const res = await apiClient.post<{ order: { id: string } }>('/api/orders', payload)
      if (res.order?.id) {
        setOrderSuccessId(res.order.id)
        dispatch(clearCart())
        setCheckoutDialogOpen(false)
      }
    } catch (err: any) {
      console.error('Order placement failed:', err)
      alert(err?.message || 'Failed to place order. Please try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: 360, md: 350 },
        height: '100%',
        bgcolor: '#ffffff',
        borderLeft: isDrawer ? 'none' : '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2.5, md: 3 },
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Order Menu
          </Typography>
          {cart.restaurantName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
              <StorefrontIcon sx={{ fontSize: 14, color: '#ea580c' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#ea580c' }} noWrap>
                {cart.restaurantName}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {cart.items.length > 0 && (
            <Button
              size="small"
              onClick={() => dispatch(clearCart())}
              sx={{
                color: '#ea580c',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                p: 0,
                minWidth: 'auto',
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              Clear all
            </Button>
          )}
          {isDrawer && (
            <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Cart Items List */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, mb: 2 }}>
        {cart.items.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 68,
                height: 68,
                bgcolor: '#fff7ed',
                color: '#ea580c',
                mb: 2,
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
              Your order is empty
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 220, fontSize: '0.85rem' }}>
              Explore delicious dishes and add them to your order menu.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {cart.items.map((item) => {
              const fallbackThumb =
                item.imageUrl ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'

              return (
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
                  }}
                >
                  {/* Thumbnail */}
                  <Box
                    component="img"
                    src={fallbackThumb}
                    alt={item.name}
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '10px',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />

                  {/* Title & Price */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}
                    >
                      {item.name}
                    </Typography>

                    {/* Stepper */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          dispatch(updateQuantity({ menuItemId: item.menuItemId, quantity: item.quantity - 1 }))
                        }
                        sx={{
                          p: 0.3,
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                        }}
                      >
                        <RemoveIcon sx={{ fontSize: 13, color: '#64748b' }} />
                      </IconButton>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, px: 0.5, minWidth: 18, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          dispatch(updateQuantity({ menuItemId: item.menuItemId, quantity: item.quantity + 1 }))
                        }
                        sx={{
                          p: 0.3,
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                        }}
                      >
                        <AddIcon sx={{ fontSize: 13, color: '#64748b' }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Right: Item Total Price & Delete */}
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      Rs {item.price * item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => dispatch(removeItem(item.menuItemId))}
                      sx={{ color: '#94a3b8', p: 0.3, mt: 0.2, '&:hover': { color: '#ef4444' } }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              )
            })}
          </Stack>
        )}
      </Box>

      {/* Bill Calculation & Checkout Footer */}
      {cart.items.length > 0 && (
        <Box sx={{ pt: 2, borderTop: '1px solid #f1f5f9' }}>
          {/* Bill breakdown items */}
          <Stack spacing={1.2} sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Item Total
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Rs {subtotal}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Delivery Fee
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {deliveryFee === 0 ? 'FREE' : `Rs ${deliveryFee}`}
              </Typography>
            </Box>

            {appliedCoupon && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 700 }}>
                    Coupon ({appliedCoupon.code})
                  </Typography>
                  <Chip
                    label="Remove"
                    size="small"
                    onClick={handleRemoveCoupon}
                    sx={{ height: 18, fontSize: '0.65rem', cursor: 'pointer' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#16a34a' }}>
                  -Rs {appliedCoupon.discount}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Coupon Input Box */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#fff7ed',
              p: 0.8,
              borderRadius: '12px',
              border: '1px dashed #fdba74',
              mb: 2.5,
            }}
          >
            <TextField
              size="small"
              placeholder="Find Promotion"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={!!appliedCoupon}
              sx={{
                flex: 1,
                '& .MuiInputBase-input': {
                  py: 0.8,
                  px: 1.2,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                },
                '& fieldset': { border: 'none' },
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleApplyCoupon}
              disabled={!!appliedCoupon || !couponCode.trim()}
              startIcon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#ea580c',
                color: '#ffffff',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                px: 1.8,
                py: 0.7,
                fontSize: '0.8rem',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#c2410c' },
              }}
            >
              Add Coupon
            </Button>
          </Box>
          {couponError && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mb: 1, fontWeight: 600 }}>
              {couponError}
            </Typography>
          )}

          {/* Total Pay */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              borderTop: '1px solid #f1f5f9',
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              To Pay
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ea580c' }}>
              Rs {finalTotal}
            </Typography>
          </Box>

          {/* Big Orange Checkout Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleCheckoutClick}
            startIcon={<ShoppingBagIcon />}
            sx={{
              bgcolor: '#ea580c',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(234, 88, 12, 0.35)',
              '&:hover': {
                bgcolor: '#c2410c',
                boxShadow: '0 10px 24px rgba(234, 88, 12, 0.45)',
              },
            }}
          >
            Checkout
          </Button>
        </Box>
      )}

      {/* Checkout Table & Note Dialog */}
      <Dialog
        open={checkoutDialogOpen}
        onClose={() => setCheckoutDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TableRestaurantIcon sx={{ color: '#ea580c' }} />
          Confirm Your Table Order
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 0.8 }}>
                Table Number / Location
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. Table 4"
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 0.8 }}>
                Special Cooking Instructions (Optional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="e.g. Less spicy, extra sauce..."
              />
            </Box>

            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Total Items</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {cart.items.reduce((s, i) => s + i.quantity, 0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Total Payable</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ea580c' }}>
                  Rs {finalTotal}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCheckoutDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmOrder}
            disabled={placingOrder}
            sx={{
              bgcolor: '#ea580c',
              fontWeight: 700,
              borderRadius: '10px',
              px: 3,
              '&:hover': { bgcolor: '#c2410c' },
            }}
          >
            {placingOrder ? <CircularProgress size={20} color="inherit" /> : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Success Dialog */}
      <Dialog
        open={!!orderSuccessId}
        onClose={() => setOrderSuccessId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '20px', p: 2, textAlign: 'center' },
        }}
      >
        <Box sx={{ py: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#dcfce7',
              color: '#16a34a',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 38 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
            Order Placed!
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Your order has been sent directly to the kitchen. You can track progress or order more items anytime.
          </Typography>
          <Chip
            label={`Order ID: ${orderSuccessId?.slice(0, 8)}`}
            sx={{ bgcolor: '#f1f5f9', fontWeight: 700, mb: 3 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={() => setOrderSuccessId(null)}
            sx={{
              bgcolor: '#ea580c',
              fontWeight: 700,
              py: 1.2,
              borderRadius: '10px',
              '&:hover': { bgcolor: '#c2410c' },
            }}
          >
            Done
          </Button>
        </Box>
      </Dialog>
    </Box>
  )
}
