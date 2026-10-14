'use client'

import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Skeleton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ViewWeekIcon from '@mui/icons-material/ViewWeek'
import ViewListIcon from '@mui/icons-material/ViewList'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import AddIcon from '@mui/icons-material/Add'

import Navbar from '@/components/common/navbar'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectIsAuthenticated,
  selectIsOwner,
  selectAuthInitialized,
} from '@/store/selectors/auth-selectors'
import { selectMyRestaurant } from '@/store/selectors/restaurant-selectors'
import { fetchMyRestaurantThunk } from '@/store/thunks/fetch-my-restaurant-thunk'
import {
  selectOrders,
  selectOrderLoading,
} from '@/store/selectors/order-selectors'
import {
  fetchOrdersThunk,
  updateOrderStatusThunk,
  createDemoOrderThunk,
} from '@/store/thunks/order-thunks'
import { optimisticUpdateStatus } from '@/store/slices/order-slice'
import { Order, OrderStatus } from '@/types/order-types'

import {
  STATUS_CONFIGS,
  OrderHeader,
  OrderMetricsBar,
  OrderCard,
  OrderStatusMenu,
  OrderTicketDialog,
  OrderKanbanBoard,
  OrderCounts,
} from '@/components/owner/orders'

function LiveOrdersSkeleton() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
        {/* Top Header Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={140} height={24} sx={{ mb: 1, borderRadius: '4px' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Skeleton variant="text" width={220} height={38} sx={{ borderRadius: '6px' }} />
              <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: '20px' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: '20px' }} />
              <Skeleton variant="rounded" width={130} height={36} sx={{ borderRadius: '20px' }} />
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: '10px' }} />
            </Box>
          </Box>
        </Box>

        {/* Metrics Filter Bar Skeleton */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, overflowX: 'auto', pb: 1 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rounded" width={110} height={38} sx={{ borderRadius: '24px', flexShrink: 0 }} />
          ))}
        </Box>

        {/* Kanban Board Columns Skeleton */}
        <Box sx={{ display: 'flex', gap: 2.5, overflowX: 'auto', pb: 2.5, alignItems: 'stretch' }}>
          {[1, 2, 3, 4, 5].map((colIndex) => (
            <Box
              key={colIndex}
              sx={{
                flex: '0 0 320px',
                width: 320,
                minWidth: 320,
                bgcolor: '#f8fafc',
                borderRadius: '16px',
                p: 1.8,
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.8,
                height: 'calc(100vh - 215px)',
                maxHeight: 'calc(100vh - 215px)',
                minHeight: 500,
              }}
            >
              {/* Column Header Skeleton */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant="circular" width={22} height={22} />
                  <Skeleton variant="text" width={120} height={24} sx={{ borderRadius: '4px' }} />
                </Box>
                <Skeleton variant="rounded" width={32} height={22} sx={{ borderRadius: '12px' }} />
              </Box>

              {/* Order Card Skeletons */}
              {[1, 2].map((cardIndex) => (
                <Box
                  key={cardIndex}
                  sx={{
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    p: 2.2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton variant="text" width={110} height={22} sx={{ borderRadius: '4px' }} />
                    <Skeleton variant="rounded" width={75} height={24} sx={{ borderRadius: '6px' }} />
                  </Box>

                  <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <Skeleton variant="text" width="60%" height={18} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="85%" height={16} />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Skeleton variant="text" width="55%" height={18} />
                      <Skeleton variant="text" width="20%" height={18} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Skeleton variant="text" width="45%" height={18} />
                      <Skeleton variant="text" width="20%" height={18} />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                    <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: '4px' }} />
                    <Skeleton variant="text" width={70} height={24} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
                    <Skeleton variant="rounded" width="100%" height={36} sx={{ borderRadius: '8px' }} />
                    <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

function OwnerOrdersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const openOrderId = searchParams.get('openOrder')
  const dispatch = useAppDispatch()

  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isOwner = useAppSelector(selectIsOwner)
  const authInitialized = useAppSelector(selectAuthInitialized)

  const restaurant = useAppSelector(selectMyRestaurant)
  const orders = useAppSelector(selectOrders)
  const loading = useAppSelector(selectOrderLoading)

  // View state
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Selected Order for KOT / Receipt Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Auto-open modal ONLY ONCE when navigating from notification
  const hasHandledOpenOrderRef = useRef<string | null>(null)

  useEffect(() => {
    if (openOrderId && orders.length > 0 && hasHandledOpenOrderRef.current !== openOrderId) {
      const match = orders.find(
        (o) => o.id === openOrderId || o.id.toLowerCase().endsWith(openOrderId.toLowerCase())
      )
      if (match) {
        hasHandledOpenOrderRef.current = openOrderId
        setSelectedOrder(match)
      }
    }
  }, [openOrderId, orders])

  // Status Action Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [menuTargetOrder, setMenuTargetOrder] = useState<Order | null>(null)

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Reference for previous order count to trigger chime on new orders
  const prevOrderCountRef = useRef<number>(orders.length)

  // Sound chime synthesizer using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15) // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch {
      // Audio autoplay policy might restrict without interaction
    }
  }

  // Auth & Initial Data Fetch
  useEffect(() => {
    if (authInitialized) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (!isOwner) {
        router.push('/')
      } else {
        dispatch(fetchMyRestaurantThunk())
          .then((action) => {
            if (fetchMyRestaurantThunk.fulfilled.match(action) && action.payload) {
              return dispatch(fetchOrdersThunk({ restaurantId: action.payload.id }))
            }
          })
          .finally(() => {
            setInitialLoading(false)
          })
      }
    }
  }, [authInitialized, isAuthenticated, isOwner, router, dispatch])

  // Polling interval for Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !restaurant) return
    const interval = setInterval(() => {
      dispatch(fetchOrdersThunk({ restaurantId: restaurant.id })).then((action) => {
        if (fetchOrdersThunk.fulfilled.match(action)) {
          if (action.payload.length > prevOrderCountRef.current) {
            playChime()
            setSnackbar({
              open: true,
              message: '🔔 New order incoming to kitchen!',
              severity: 'info',
            })
          }
          prevOrderCountRef.current = action.payload.length
        }
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [autoRefresh, restaurant, dispatch, soundEnabled])

  const handleManualRefresh = async () => {
    if (!restaurant) return
    setIsRefreshing(true)
    await dispatch(fetchOrdersThunk({ restaurantId: restaurant.id }))
    setIsRefreshing(false)
    setSnackbar({ open: true, message: 'Orders refreshed', severity: 'success' })
  }

  const handleCreateDemoOrder = async () => {
    const result = await dispatch(createDemoOrderThunk())
    if (createDemoOrderThunk.fulfilled.match(result)) {
      playChime()
      setSnackbar({
        open: true,
        message: 'Demo test order created successfully!',
        severity: 'success',
      })
    } else {
      setSnackbar({
        open: true,
        message: result.payload || 'Failed to create demo order',
        severity: 'error',
      })
    }
  }

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    // Optimistic update
    dispatch(optimisticUpdateStatus({ id: orderId, status: nextStatus }))
    const result = await dispatch(updateOrderStatusThunk({ orderId, status: nextStatus }))

    if (updateOrderStatusThunk.fulfilled.match(result)) {
      setSnackbar({
        open: true,
        message: `Order status updated to "${STATUS_CONFIGS[nextStatus]?.label || nextStatus}"`,
        severity: 'success',
      })
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null)
      }
    } else {
      setSnackbar({
        open: true,
        message: result.payload || 'Failed to update order status',
        severity: 'error',
      })
      // Re-fetch to sync
      if (restaurant) {
        dispatch(fetchOrdersThunk({ restaurantId: restaurant.id }))
      }
    }
  }

  // Open status change menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, order: Order) => {
    setMenuAnchorEl(event.currentTarget)
    setMenuTargetOrder(order)
  }

  const handleCloseMenu = () => {
    setMenuAnchorEl(null)
    setMenuTargetOrder(null)
  }

  const handleSelectStatusFromMenu = (status: OrderStatus) => {
    if (menuTargetOrder) {
      handleUpdateStatus(menuTargetOrder.id, status)
    }
    handleCloseMenu()
  }

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard?.writeText(id)
    setSnackbar({ open: true, message: 'Order ID copied to clipboard', severity: 'info' })
  }

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let list = [...orders]

    // Tab filter for List view
    if (activeTab !== 'ALL') {
      if (activeTab === 'NEW') {
        list = list.filter((o) => o.status === 'PLACED' || o.status === 'ACCEPTED')
      } else if (activeTab === 'PREPARING') {
        list = list.filter((o) => o.status === 'PREPARING')
      } else if (activeTab === 'READY') {
        list = list.filter((o) => o.status === 'READY')
      } else if (activeTab === 'PICKED_UP') {
        list = list.filter((o) => o.status === 'OUT_FOR_DELIVERY')
      } else if (activeTab === 'COMPLETED') {
        list = list.filter((o) => o.status === 'DELIVERED')
      } else if (activeTab === 'CANCELLED') {
        list = list.filter((o) => o.status === 'REJECTED' || o.status === 'CANCELLED')
      }
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((o) => {
        const idMatch = o.id.toLowerCase().includes(q)
        const nameMatch = o.customer?.name?.toLowerCase().includes(q) || false
        const phoneMatch = o.customer?.phone?.toLowerCase().includes(q) || false
        const addressMatch = o.address?.toLowerCase().includes(q) || false
        const itemMatch = o.items?.some((it) => it.name.toLowerCase().includes(q)) || false
        return idMatch || nameMatch || phoneMatch || addressMatch || itemMatch
      })
    }

    return list
  }, [orders, activeTab, searchQuery])

  // Status Counts
  const counts: OrderCounts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter((o) => o.status === 'PLACED' || o.status === 'ACCEPTED').length,
      preparing: orders.filter((o) => o.status === 'PREPARING').length,
      ready: orders.filter((o) => o.status === 'READY').length,
      pickedUp: orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length,
      completed: orders.filter((o) => o.status === 'DELIVERED').length,
      cancelled: orders.filter((o) => o.status === 'REJECTED' || o.status === 'CANCELLED').length,
    }
  }, [orders])

  if (!authInitialized || initialLoading || (loading && orders.length === 0)) {
    return <LiveOrdersSkeleton />
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
        {/* Top Header Bar */}
        <OrderHeader
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={setAutoRefresh}
          isRefreshing={isRefreshing}
          onManualRefresh={handleManualRefresh}
          onCreateDemoOrder={handleCreateDemoOrder}
        />

        {/* Metric / Status Summary Cards */}
        <OrderMetricsBar
          counts={counts}
          onSelectFilter={(tab) => {
            setViewMode('list')
            setActiveTab(tab)
          }}
        />

        {/* Search, Filter Pills & View Mode Switcher */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Search Box */}
          <TextField
            size="small"
            placeholder="Search by order #, customer, dish, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { xs: '100%', sm: 380 },
              bgcolor: '#ffffff',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />

          {/* View Mode Switcher */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
            <Box sx={{ display: 'inline-flex', bgcolor: '#e2e8f0', p: 0.4, borderRadius: '8px' }}>
              <Button
                size="small"
                onClick={() => setViewMode('kanban')}
                startIcon={<ViewWeekIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  px: 1.5,
                  py: 0.5,
                  bgcolor: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                  color: viewMode === 'kanban' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': { bgcolor: viewMode === 'kanban' ? '#ffffff' : 'rgba(0,0,0,0.04)' },
                }}
              >
                Kitchen Board
              </Button>
              <Button
                size="small"
                onClick={() => setViewMode('list')}
                startIcon={<ViewListIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  px: 1.5,
                  py: 0.5,
                  bgcolor: viewMode === 'list' ? '#ffffff' : 'transparent',
                  color: viewMode === 'list' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': { bgcolor: viewMode === 'list' ? '#ffffff' : 'rgba(0,0,0,0.04)' },
                }}
              >
                List View
              </Button>
            </Box>
          </Box>
        </Box>

        {/* List View Status Tabs */}
        {viewMode === 'list' && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {[
              { id: 'ALL', label: 'All Orders', count: counts.all },
              { id: 'NEW', label: '🔔 Incoming', count: counts.new },
              { id: 'PREPARING', label: '🍳 Preparing', count: counts.preparing },
              { id: 'READY', label: '🛎️ Ready for Pickup', count: counts.ready },
              { id: 'PICKED_UP', label: '🛵 Picked Up', count: counts.pickedUp },
              { id: 'COMPLETED', label: '✅ Delivered', count: counts.completed },
              { id: 'CANCELLED', label: '⚠️ Cancelled', count: counts.cancelled },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="small"
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  px: 2,
                  py: 0.5,
                  bgcolor: activeTab === tab.id ? '#0f172a' : '#ffffff',
                  color: activeTab === tab.id ? '#ffffff' : '#64748b',
                  border: '1px solid',
                  borderColor: activeTab === tab.id ? '#0f172a' : '#e2e8f0',
                  '&:hover': {
                    bgcolor: activeTab === tab.id ? '#1e293b' : '#f1f5f9',
                  },
                }}
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </Box>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              bgcolor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              maxWidth: 600,
              mx: 'auto',
              mt: 2,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
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
              <ReceiptLongIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              No Orders Received Yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3, lineHeight: 1.6 }}>
              When customers place orders from the dine-in or online menu, they will appear here in real-time.
              You can test the kitchen display right now by generating a demo order.
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateDemoOrder}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '8px',
                bgcolor: '#ea580c',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1,
                '&:hover': { bgcolor: '#c2410c' },
              }}
            >
              Generate Demo Order
            </Button>
          </Box>
        ) : viewMode === 'kanban' ? (
          /* Kanban Kitchen Display Board */
          <OrderKanbanBoard
            orders={filteredOrders}
            onUpdateStatus={handleUpdateStatus}
            onOpenMenu={handleOpenMenu}
            onViewDetails={(order) => setSelectedOrder(order)}
            onCopyOrderId={handleCopyOrderId}
          />
        ) : (
          /* List / Grid View */
          <Box>
            {filteredOrders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ color: '#64748b', fontWeight: 600 }}>
                  No orders match the current filter or search criteria.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    onOpenMenu={handleOpenMenu}
                    onViewDetails={(o) => setSelectedOrder(o)}
                    onCopyOrderId={handleCopyOrderId}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>

      {/* Status Jump Menu */}
      <OrderStatusMenu
        anchorEl={menuAnchorEl}
        targetOrder={menuTargetOrder}
        onClose={handleCloseMenu}
        onSelectStatus={handleSelectStatusFromMenu}
      />

      {/* Kitchen Order Ticket (KOT) Dialog */}
      <OrderTicketDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '8px', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default function OwnerOrdersPage() {
  return (
    <Suspense fallback={<LiveOrdersSkeleton />}>
      <OwnerOrdersContent />
    </Suspense>
  )
}
