'use client'

import React, { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Popover,
  Stack,
  Button,
  Chip,
  Divider,
  Slide,
  Paper,
} from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import CloseIcon from '@mui/icons-material/Close'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectMyRestaurant } from '@/store/selectors/restaurant-selectors'
import { fetchMyRestaurantThunk } from '@/store/thunks/fetch-my-restaurant-thunk'
import { Order } from '@/types/order-types'

export interface OrderNotificationItem {
  id: string
  orderId: string
  formattedId: string
  customerName: string
  tableOrAddress: string
  itemsSummary: string
  totalAmount: number
  status: string
  createdAt: string
  read: boolean
}

export function OwnerNotificationBell() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const restaurant = useAppSelector(selectMyRestaurant)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState<OrderNotificationItem[]>([])
  const [activeToast, setActiveToast] = useState<OrderNotificationItem | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  // Track known order IDs to avoid duplicate alerts
  const knownOrderIdsRef = useRef<Set<string>>(new Set())
  const isInitialLoadRef = useRef(true)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Web Audio chime for incoming orders
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      // Dual-tone high notification chime (D5 -> A5)
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12)

      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.45)
    } catch {
      // Audio might be suppressed by browser autoplay policy
    }
  }

  // Ensure owner restaurant is loaded
  useEffect(() => {
    if (!restaurant) {
      dispatch(fetchMyRestaurantThunk())
    }
  }, [restaurant, dispatch])

  // Load saved notifications read status from localStorage
  useEffect(() => {
    if (!restaurant?.id) return
    try {
      const saved = localStorage.getItem(`dinein_owner_notifications_${restaurant.id}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setNotifications(parsed)
          parsed.forEach((n: OrderNotificationItem) => knownOrderIdsRef.current.add(n.orderId))
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [restaurant?.id])

  // Save notifications to localStorage on update
  const saveNotifications = (newList: OrderNotificationItem[]) => {
    setNotifications(newList)
    if (restaurant?.id) {
      try {
        localStorage.setItem(`dinein_owner_notifications_${restaurant.id}`, JSON.stringify(newList.slice(0, 30)))
      } catch {
        // Ignore localStorage quota errors
      }
    }
  }

  // Trigger floating toast that auto-hides after 5 seconds
  const triggerToast = (item: OrderNotificationItem) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setActiveToast(item)
    setToastVisible(true)

    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setActiveToast(null), 300)
    }, 5000)
  }

  // Poll for new restaurant orders
  useEffect(() => {
    if (!restaurant?.id) return

    let active = true

    const checkOrders = async () => {
      try {
        const res = await fetch(`/api/orders?restaurantId=${encodeURIComponent(restaurant.id)}`)
        if (!res.ok) return
        const data = await res.json()
        const fetchedOrders: Order[] = data.orders || []

        if (!active) return

        // On first run, register current orders without firing toast
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false
          fetchedOrders.forEach((o) => knownOrderIdsRef.current.add(o.id))

          // Populate initial notification list if empty
          setNotifications((prev) => {
            if (prev.length > 0) return prev
            const initialList: OrderNotificationItem[] = fetchedOrders.slice(0, 15).map((o) => ({
              id: `notif-${o.id}`,
              orderId: o.id,
              formattedId: `#${o.id.slice(-6).toUpperCase()}`,
              customerName: o.customer?.name || 'Walk-In Customer',
              tableOrAddress: o.address || 'Dine-In',
              itemsSummary: (o.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ') || 'Items ordered',
              totalAmount: o.totalAmount,
              status: o.status,
              createdAt: o.createdAt,
              read: true,
            }))
            return initialList
          })
          return
        }

        // Detect genuinely new orders
        const newOrders = fetchedOrders.filter((o) => !knownOrderIdsRef.current.has(o.id))

        if (newOrders.length > 0) {
          playNotificationChime()

          const newNotifs: OrderNotificationItem[] = newOrders.map((o) => {
            knownOrderIdsRef.current.add(o.id)
            return {
              id: `notif-${o.id}-${Date.now()}`,
              orderId: o.id,
              formattedId: `#${o.id.slice(-6).toUpperCase()}`,
              customerName: o.customer?.name || 'Walk-In Customer',
              tableOrAddress: o.address || 'Dine-In',
              itemsSummary: (o.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ') || 'Items ordered',
              totalAmount: o.totalAmount,
              status: o.status,
              createdAt: o.createdAt,
              read: false,
            }
          })

          // Show floating toast for the newest incoming order
          triggerToast(newNotifs[0])

          // Prepend to notifications list
          setNotifications((prev) => {
            const updated = [...newNotifs, ...prev].slice(0, 30)
            if (restaurant?.id) {
              try {
                localStorage.setItem(`dinein_owner_notifications_${restaurant.id}`, JSON.stringify(updated))
              } catch {}
            }
            return updated
          })
        }
      } catch (err) {
        console.error('Failed to poll owner orders for notification bell:', err)
      }
    }

    // Initial check
    checkOrders()

    // Poll every 8 seconds
    const interval = setInterval(checkOrders, 8000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [restaurant?.id])

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  // Handle opening popover
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  // Handle closing popover
  const handleClosePopover = () => {
    setAnchorEl(null)
  }

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }))
    saveNotifications(updated)
  }

  // Click on a specific notification
  const handleNotificationClick = (item: OrderNotificationItem) => {
    // Mark this one as read
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    saveNotifications(updated)
    handleClosePopover()

    // Navigate to live orders and open modal for this order
    router.push(`/owner/orders?openOrder=${encodeURIComponent(item.orderId)}`)
  }

  // Relative time helper
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      const diffSec = Math.floor(diffMs / 1000)
      if (diffSec < 60) return 'Just now'
      const diffMin = Math.floor(diffSec / 60)
      if (diffMin < 60) return `${diffMin}m ago`
      const diffHr = Math.floor(diffMin / 60)
      if (diffHr < 24) return `${diffHr}h ago`
      return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' })
    } catch {
      return 'Recently'
    }
  }

  const isPopoverOpen = Boolean(anchorEl)

  return (
    <>
      {/* 1. Header Bell Icon with Badge */}
      <IconButton
        onClick={handleOpenPopover}
        size="small"
        sx={{
          color: unreadCount > 0 ? '#ea580c' : '#475569',
          bgcolor: unreadCount > 0 ? '#fff7ed' : '#f8fafc',
          border: '1px solid',
          borderColor: unreadCount > 0 ? '#fed7aa' : '#e2e8f0',
          p: 0.9,
          borderRadius: '10px',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: unreadCount > 0 ? '#ffedd5' : '#f1f5f9',
            borderColor: '#ea580c',
          },
        }}
        title="Owner Notifications"
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontWeight: 800,
              fontSize: '0.72rem',
              height: 18,
              minWidth: 18,
              bgcolor: '#ea580c',
            },
          }}
        >
          {unreadCount > 0 ? (
            <NotificationsActiveIcon sx={{ fontSize: 20 }} />
          ) : (
            <NotificationsNoneIcon sx={{ fontSize: 20 }} />
          )}
        </Badge>
      </IconButton>

      {/* 2. Notifications Popover ("rest user can see after click on it") */}
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxWidth: '92vw',
            mt: 1.5,
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} New`}
                size="small"
                sx={{
                  bgcolor: '#fff7ed',
                  color: '#ea580c',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  height: 20,
                  border: '1px solid #fed7aa',
                }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleMarkAllAsRead}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: '#64748b',
                p: 0.5,
                '&:hover': { color: '#0f172a' },
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* List of Notifications */}
        <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#94a3b8' }}>
              <NotificationsNoneIcon sx={{ fontSize: 36, mb: 1, color: '#cbd5e1' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                No notifications yet
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                New incoming orders will appear here automatically.
              </Typography>
            </Box>
          ) : (
            <Stack divider={<Divider sx={{ borderColor: '#f8fafc' }} />}>
              {notifications.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  sx={{
                    p: 1.8,
                    bgcolor: item.read ? '#ffffff' : '#fffaf5',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: item.read ? '#f8fafc' : '#fff4eb',
                    },
                  }}
                >
                  {/* Unread indicator dot */}
                  {!item.read && (
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: '#ea580c',
                        position: 'absolute',
                        top: 14,
                        right: 14,
                      }}
                    />
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, pr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color: '#0f172a',
                          fontFamily: 'monospace',
                          fontSize: '0.88rem',
                        }}
                      >
                        {item.formattedId}
                      </Typography>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: item.status === 'PLACED' ? '#fff7ed' : '#f1f5f9',
                          color: item.status === 'PLACED' ? '#ea580c' : '#475569',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#94a3b8' }}>
                      <AccessTimeIcon sx={{ fontSize: 12 }} />
                      <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>
                        {getRelativeTime(item.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.3 }}>
                    👤 {item.customerName} • 📍 {item.tableOrAddress}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 0.8,
                    }}
                  >
                    {item.itemsSummary}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ea580c' }}>
                      ₹{item.totalAmount}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.3,
                        '&:hover': { color: '#ea580c' },
                      }}
                    >
                      View Order <ArrowForwardIcon sx={{ fontSize: 13 }} />
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Button
            size="small"
            fullWidth
            onClick={() => {
              handleClosePopover()
              router.push('/owner/orders')
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: '#0f172a',
              borderRadius: '8px',
              py: 0.8,
              '&:hover': { bgcolor: '#e2e8f0' },
            }}
          >
            Open Live Kitchen Board →
          </Button>
        </Box>
      </Popover>

      {/* 3. Floating Banner Toast: "if any new order get show notificaion and hide after some time" */}
      <Slide direction="left" in={toastVisible && Boolean(activeToast)} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            top: { xs: 72, sm: 80 },
            right: { xs: 12, sm: 24 },
            zIndex: 9999,
            width: { xs: 'calc(100vw - 24px)', sm: 380 },
            borderRadius: '16px',
            border: '2px solid #ea580c',
            bgcolor: '#ffffff',
            boxShadow: '0 16px 40px rgba(234, 88, 12, 0.22), 0 4px 12px rgba(0,0,0,0.08)',
            p: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  bgcolor: '#fff7ed',
                  p: 0.7,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <NotificationsActiveIcon sx={{ color: '#ea580c', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  🎉 New Order Received!
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Order {activeToast?.formattedId}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setToastVisible(false)}
              sx={{ color: '#94a3b8', p: 0.5, '&:hover': { color: '#0f172a' } }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Details */}
          <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: '10px', mb: 1.5, border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                👤 {activeToast?.customerName}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ea580c' }}>
                ₹{activeToast?.totalAmount}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
              📍 {activeToast?.tableOrAddress}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#475569',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.3,
              }}
            >
              {activeToast?.itemsSummary}
            </Typography>
          </Box>

          {/* Action button */}
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => {
              if (activeToast) {
                setToastVisible(false)
                router.push(`/owner/orders?openOrder=${encodeURIComponent(activeToast.orderId)}`)
              }
            }}
            sx={{
              bgcolor: '#ea580c',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              borderRadius: '10px',
              py: 0.9,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
              '&:hover': { bgcolor: '#c2410c' },
            }}
          >
            Review & Confirm Order →
          </Button>
        </Paper>
      </Slide>
    </>
  )
}
