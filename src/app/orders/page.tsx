'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Divider,
} from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ReplayIcon from '@mui/icons-material/Replay'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { CustomerSidebar } from '@/components/customer/customer-sidebar'
import { CustomerHeader } from '@/components/customer/customer-header'
import { CartSidebar } from '@/components/customer/cart-sidebar'

import { apiClient } from '@/utils/api-client'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem } from '@/store/slices/cart-slice'
import { selectCurrentUser, selectIsAuthenticated } from '@/store/selectors/auth-selectors'
import { useHistoryModal } from '@/hooks/use-history-modal'

interface OrderItem {
  id: string
  menuItemId?: string
  name: string
  price: number
  quantity: number
  isVeg?: boolean
}

interface Order {
  id: string
  restaurantId: string
  status: string
  totalAmount: number
  subtotal?: number
  deliveryFee?: number
  discount?: number
  address?: string
  paymentMode?: string
  createdAt: string
  restaurant?: {
    id: string
    name: string
    address?: string
    phone?: string
  }
  items: OrderItem[]
}

function OrdersContent() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const cart = useAppSelector((state) => state.cart)
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Responsive Drawer States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  useHistoryModal({
    open: mobileSidebarOpen,
    onClose: () => setMobileSidebarOpen(false),
    modalId: 'mobile-sidebar-orders',
  })
  useHistoryModal({
    open: mobileCartOpen,
    onClose: () => setMobileCartOpen(false),
    modalId: 'mobile-cart-orders',
  })

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await apiClient.get<{ orders: Order[] }>('/api/orders')
        setOrders(res.orders || [])
      } catch (err) {
        console.error('Failed to load orders:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated])

  const handleReorder = (order: Order) => {
    order.items.forEach((it) => {
      dispatch(
        addItem({
          restaurantId: order.restaurantId,
          restaurantName: order.restaurant?.name || 'Restaurant',
          item: {
            menuItemId: it.menuItemId || it.id,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            isVeg: it.isVeg ?? true,
          },
        })
      )
    })
    router.push('/checkout')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: '#dcfce7', text: '#15803d' }
      case 'CANCELLED':
        return { bg: '#fee2e2', text: '#b91c1c' }
      case 'PREPARING':
        return { bg: '#fef3c7', text: '#b45309' }
      case 'ACCEPTED':
        return { bg: '#e0f2fe', text: '#0369a1' }
      default:
        return { bg: '#fff7ed', text: '#ea580c' }
    }
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
        <CustomerSidebar activeNav="Orders" />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 260 } }}
      >
        <CustomerSidebar activeNav="Orders" onItemClick={() => setMobileSidebarOpen(false)} />
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
              Your Past Orders
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              View live status, order details, receipts, and quickly reorder your favorites
            </Typography>
          </Box>

          {!isAuthenticated ? (
            /* Unauthenticated Prompt */
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                bgcolor: '#ffffff',
                borderRadius: '20px',
                border: '1.5px dashed #e2e8f0',
                px: 3,
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 56, color: '#94a3b8', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                Sign In to View Orders
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3, maxWidth: 360, mx: 'auto' }}>
                Please log in with your customer account to see your live orders and historical receipts.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/login')}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  bgcolor: '#ea580c',
                  px: 4,
                  py: 1.2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#c2410c' },
                }}
              >
                Sign In
              </Button>
            </Box>
          ) : loading ? (
            /* Skeleton Loading */
            <Stack spacing={2.5}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} elevation={0} sx={{ p: 3, borderRadius: '18px', border: '1.5px solid #f1f5f9' }}>
                  <Skeleton variant="text" width="40%" height={28} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={18} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '12px', mb: 2 }} />
                  <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: '10px' }} />
                </Card>
              ))}
            </Stack>
          ) : orders.length === 0 ? (
            /* Empty State */
            <Box
              sx={{
                textAlign: 'center',
                py: 9,
                bgcolor: '#ffffff',
                borderRadius: '20px',
                border: '1.5px dashed #e2e8f0',
                px: 3,
              }}
            >
              <ReceiptLongIcon sx={{ fontSize: 56, color: '#94a3b8', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                No orders placed yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3, maxWidth: 380, mx: 'auto' }}>
                You haven&apos;t placed any orders yet. Explore our partner restaurants and treat yourself!
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/home')}
                startIcon={<StorefrontIcon />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  bgcolor: '#ea580c',
                  px: 3.5,
                  py: 1.2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#c2410c' },
                }}
              >
                Explore Restaurants
              </Button>
            </Box>
          ) : (
            /* Orders List */
            <Stack spacing={2.5}>
              {orders.map((order) => {
                const statusStyle = getStatusColor(order.status)
                const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <Card
                    key={order.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '18px',
                      border: '1.5px solid #e2e8f0',
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#fed7aa',
                        boxShadow: '0 8px 24px -6px rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    {/* Order Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                          {order.restaurant?.name || 'Restaurant'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 13 }} />
                          {dateStr} • Order #{order.id.slice(0, 8).toUpperCase()}
                        </Typography>
                      </Box>

                      <Chip
                        label={order.status.replace(/_/g, ' ')}
                        size="small"
                        sx={{
                          bgcolor: statusStyle.bg,
                          color: statusStyle.text,
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          borderRadius: '8px',
                        }}
                      />
                    </Box>

                    {/* Order Details & Items */}
                    <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '12px', mb: 2 }}>
                      <Stack spacing={1}>
                        {!order.items || order.items.length === 0 ? (
                          <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            Dishes recorded under Order #{order.id.slice(0, 8).toUpperCase()} • ₹{order.totalAmount}
                          </Typography>
                        ) : (
                          order.items.map((it, idx) => (
                            <Box
                              key={idx}
                              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {it.quantity}x {it.name}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                                ₹{(Number(it.price) * it.quantity).toFixed(0)}
                              </Typography>
                            </Box>
                          ))
                        )}
                      </Stack>

                      {order.address && (
                        <>
                          <Divider sx={{ my: 1.2, borderColor: '#e2e8f0' }} />
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            📍 {order.address}
                          </Typography>
                        </>
                      )}
                    </Box>

                    {/* Order Footer & Total */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        pt: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          Total Paid ({order.paymentMode || 'CASH'}):
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#ea580c' }}>
                          ₹{order.totalAmount}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1.5}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ReplayIcon />}
                          onClick={() => handleReorder(order)}
                          sx={{
                            borderRadius: '10px',
                            fontWeight: 700,
                            bgcolor: '#ea580c',
                            px: 2.5,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#c2410c' },
                          }}
                        >
                          Reorder
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                )
              })}
            </Stack>
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
    </Box>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<Box sx={{ p: 4 }}><Skeleton variant="rounded" height={60} /></Box>}>
      <OrdersContent />
    </Suspense>
  )
}
