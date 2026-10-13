'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Button,
  Stack,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import LogoutIcon from '@mui/icons-material/Logout'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsOwner,
  selectAuthInitialized,
} from '@/store/selectors/auth-selectors'
import { fetchMeThunk } from '@/store/thunks/fetch-me-thunk'
import { logoutThunk } from '@/store/thunks/logout-thunk'

export function Navbar() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isOwner = useAppSelector(selectIsOwner)
  const initialized = useAppSelector(selectAuthInitialized)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  useEffect(() => {
    if (!initialized) {
      dispatch(fetchMeThunk())
    }
  }, [dispatch, initialized])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleMenuClose()
    await dispatch(logoutThunk())
    router.push('/')
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo & Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: '#E85D04',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(232, 93, 4, 0.25)',
                }}
              >
                <RestaurantMenuIcon fontSize="small" />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#1D2A44',
                }}
              >
                DineDirect
              </Typography>
            </Stack>
          </Link>

          {/* Right Action Items */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {isAuthenticated && user ? (
              <>
                {isOwner ? (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    component={Link}
                    href="/owner/dashboard"
                    startIcon={<StorefrontIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Portal
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="text"
                      color="secondary"
                      size="small"
                      component={Link}
                      href="/orders"
                      startIcon={<ReceiptLongIcon />}
                    >
                      My Orders
                    </Button>
                  </>
                )}

                <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 1 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: isOwner ? '#2B2D42' : '#E85D04',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      minWidth: 180,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      borderRadius: 2,
                      mt: 1,
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1D2A44' }}>
                      {user.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={isOwner ? 'Restaurant Owner' : 'Customer'}
                      color={isOwner ? 'secondary' : 'primary'}
                      sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>

                  {isOwner && (
                    <MenuItem
                      component={Link}
                      href="/owner/dashboard"
                      onClick={handleMenuClose}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      Dashboard
                    </MenuItem>
                  )}
                  {isOwner && (
                    <MenuItem
                      component={Link}
                      href="/owner/menu"
                      onClick={handleMenuClose}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      Manage Menu
                    </MenuItem>
                  )}

                  <MenuItem onClick={handleLogout} sx={{ color: '#D00000', fontSize: '0.9rem' }}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  component={Link}
                  href="/login"
                  sx={{ borderRadius: 2 }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  href="/register"
                  sx={{ borderRadius: 2 }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
export default Navbar
