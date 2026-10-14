'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Drawer,
  Typography,
  Button,
  Stack,
  Badge,
  Card,
  Avatar,
  Chip,
  Skeleton,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { CustomerSidebar } from '@/components/customer/customer-sidebar'
import { CustomerHeader } from '@/components/customer/customer-header'
import { CartSidebar } from '@/components/customer/cart-sidebar'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectCurrentUser, selectIsAuthenticated } from '@/store/selectors/auth-selectors'
import { logoutThunk } from '@/store/thunks/logout-thunk'
import { useHistoryModal } from '@/hooks/use-history-modal'

function ProfileContent() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const cart = useAppSelector((state) => state.cart)

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [vegPref, setVegPref] = useState(false)

  // Responsive Drawer States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  useHistoryModal({
    open: mobileSidebarOpen,
    onClose: () => setMobileSidebarOpen(false),
    modalId: 'mobile-sidebar-profile',
  })
  useHistoryModal({
    open: mobileCartOpen,
    onClose: () => setMobileCartOpen(false),
    modalId: 'mobile-cart-profile',
  })

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    router.push('/login')
  }

  const totalCartCount = cart.items.reduce((sum, it) => sum + it.quantity, 0)
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

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
        <CustomerSidebar activeNav="Profile" />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 260 } }}
      >
        <CustomerSidebar activeNav="Profile" onItemClick={() => setMobileSidebarOpen(false)} />
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

        <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, flex: 1, maxWidth: 800 }}>
          <Box sx={{ mb: 3.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
              My Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Manage your personal information, saved addresses, and dining preferences
            </Typography>
          </Box>

          {!isAuthenticated || !user ? (
            /* Unauthenticated Prompt */
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
              <LockOutlinedIcon sx={{ fontSize: 56, color: '#94a3b8', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                Not Signed In
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3, maxWidth: 360, mx: 'auto' }}>
                Sign in to view your profile details, manage addresses, and view order history.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={() => router.push('/login')}
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
                  Sign In
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/register')}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    borderColor: '#cbd5e1',
                    color: '#334155',
                    px: 3.5,
                    py: 1.2,
                    textTransform: 'none',
                  }}
                >
                  Create Account
                </Button>
              </Stack>
            </Box>
          ) : (
            /* Authenticated Profile View */
            <Stack spacing={3}>
              {/* Profile Card */}
              <Card elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1.5px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: '#ea580c',
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      boxShadow: '0 8px 16px -4px rgba(234, 88, 12, 0.4)',
                    }}
                  >
                    {initial}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {user.name}
                      </Typography>
                      <Chip
                        label={user.role === 'RESTAURANT_OWNER' ? 'Partner Owner' : 'Customer'}
                        size="small"
                        sx={{
                          bgcolor: user.role === 'RESTAURANT_OWNER' ? '#eff6ff' : '#fff7ed',
                          color: user.role === 'RESTAURANT_OWNER' ? '#1d4ed8' : '#ea580c',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                      {user.email}
                    </Typography>
                    {user.phone && (
                      <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
                        <PhoneOutlinedIcon sx={{ fontSize: 16 }} />
                        {user.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />

                {/* Account Details Form */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
                  Personal Information
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 0.5, display: 'block' }}>
                      Full Name
                    </Typography>
                    <TextField fullWidth size="small" value={user.name} disabled sx={{ bgcolor: '#f8fafc' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 0.5, display: 'block' }}>
                      Email Address
                    </Typography>
                    <TextField fullWidth size="small" value={user.email} disabled sx={{ bgcolor: '#f8fafc' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 0.5, display: 'block' }}>
                      Phone Number
                    </Typography>
                    <TextField fullWidth size="small" value={user.phone || '+91 98765 43210'} disabled sx={{ bgcolor: '#f8fafc' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 0.5, display: 'block' }}>
                      Account Role
                    </Typography>
                    <TextField fullWidth size="small" value={user.role} disabled sx={{ bgcolor: '#f8fafc' }} />
                  </Box>
                </Box>
              </Card>

              {/* Preferences */}
              <Card elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1.5px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5 }}>
                  Preferences & Settings
                </Typography>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        color="warning"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          Order Updates & Delivery SMS
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Receive live kitchen updates and rider notifications
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={vegPref}
                        onChange={(e) => setVegPref(e.target.checked)}
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          Vegetarian Dining Preference 🌱
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Prioritize pure veg restaurants and dishes on your home feed
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </Card>

              {/* Logout Action */}
              <Card elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1.5px solid #fee2e2', bgcolor: '#fff5f5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b91c1c' }}>
                      Sign Out
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#ef4444' }}>
                      Safely logout of your active customer session
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                    sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
                  >
                    Logout
                  </Button>
                </Box>
              </Card>
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

export default function ProfilePage() {
  return (
    <Suspense fallback={<Box sx={{ p: 4 }}><Skeleton variant="rounded" height={60} /></Box>}>
      <ProfileContent />
    </Suspense>
  )
}
