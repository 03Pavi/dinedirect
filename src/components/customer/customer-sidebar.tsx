'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SearchIcon from '@mui/icons-material/Search'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import LogoutIcon from '@mui/icons-material/Logout'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logoutThunk } from '@/store/thunks/logout-thunk'
import { selectCurrentUser, selectIsAuthenticated } from '@/store/selectors/auth-selectors'

interface CustomerSidebarProps {
  onItemClick?: () => void
  activeNav?: string
  setActiveNav?: (nav: string) => void
}

export function CustomerSidebar({
  onItemClick,
  activeNav = 'Home',
  setActiveNav,
}: CustomerSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const navItems = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Search', icon: <SearchIcon /> },
    { label: 'Orders', icon: <ReceiptLongIcon /> },
    { label: 'Offers', icon: <LocalOfferIcon /> },
    { label: 'Profile', icon: <PersonOutlineIcon /> },
    { label: 'More', icon: <MoreHorizIcon /> },
  ]

  const handleNavClick = (label: string) => {
    if (setActiveNav) {
      setActiveNav(label)
    }
    if (onItemClick) {
      onItemClick()
    }
  }

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    if (onItemClick) onItemClick()
    router.push('/login')
  }

  return (
    <Box
      sx={{
        width: { xs: 240, md: 220 },
        height: '100%',
        bgcolor: '#ffffff',
        borderRight: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2.5,
      }}
    >
      <Box>
        {/* Brand Header */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              mr: 1.5,
              boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)',
            }}
          >
            <RestaurantMenuIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            DineDirect
          </Typography>
        </Link>

        {/* Navigation List */}
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {navItems.map((item) => {
            const isActive = activeNav === item.label
            return (
              <ListItemButton
                key={item.label}
                onClick={() => handleNavClick(item.label)}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  px: 1.8,
                  bgcolor: isActive ? 'rgba(234, 88, 12, 0.08)' : 'transparent',
                  color: isActive ? '#ea580c' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(234, 88, 12, 0.12)' : '#f8fafc',
                    color: '#0f172a',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#ea580c' : '#64748b',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 700 : 600,
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      {/* Bottom User / Sign In Section */}
      <Box sx={{ pt: 2, borderTop: '1px solid #f1f5f9' }}>
        {isAuthenticated && user ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.2,
              borderRadius: '12px',
              bgcolor: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#ea580c',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.2,
                    fontSize: '0.88rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    fontWeight: 600,
                    fontSize: '0.74rem',
                    textTransform: 'capitalize',
                    display: 'block',
                  }}
                >
                  {user.role === 'RESTAURANT_OWNER' ? 'Owner' : 'Customer'}
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Sign Out">
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  color: '#94a3b8',
                  p: 0.6,
                  borderRadius: '8px',
                  '&:hover': { color: '#e11d48', bgcolor: '#fff1f2' },
                }}
              >
                <LogoutIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Button
            fullWidth
            onClick={() => router.push('/login')}
            variant="contained"
            startIcon={<PersonOutlineIcon />}
            sx={{
              py: 1.2,
              borderRadius: '24px',
              bgcolor: '#ea580c',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
              '&:hover': {
                bgcolor: '#c2410c',
              },
            }}
          >
            Sign In
          </Button>
        )}
      </Box>
    </Box>
  )
}
