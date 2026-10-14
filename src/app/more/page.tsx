'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Drawer,
  Typography,
  Grid,
  Button,
  Stack,
  Badge,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  Skeleton,
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import StorefrontIcon from '@mui/icons-material/Storefront'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { CustomerSidebar } from '@/components/customer/customer-sidebar'
import { CustomerHeader } from '@/components/customer/customer-header'
import { CartSidebar } from '@/components/customer/cart-sidebar'

import { useAppSelector } from '@/store/hooks'
import { useHistoryModal } from '@/hooks/use-history-modal'

const FAQS = [
  {
    q: 'How does table QR dine-in ordering work?',
    a: 'When dining at any partner restaurant, simply open your camera or scanner and scan the QR code located on your table. You will immediately see the digital live menu with your table number pre-selected. Add items to your cart and place your order—the kitchen will prepare and deliver dishes straight to your table!',
  },
  {
    q: 'Can I order for takeaway or doorstep delivery?',
    a: 'Yes! On checkout, you can choose between Dine-In (with your table number), Takeaway (pick up from counter), or Doorstep Delivery. With Delivery, you can use our interactive map and GPS locator to pinpoint your exact doorstep.',
  },
  {
    q: 'What payment modes are supported?',
    a: 'We support Cash on Delivery / Pay at Counter, UPI (Google Pay, PhonePe, Paytm), and Credit/Debit Cards via secure gateway integration.',
  },
  {
    q: 'How do I register my restaurant on DineDirect?',
    a: 'Simply click "Partner With Us" or head to the restaurant registration page. You can customize your menu categories, upload dishes, print table QR codes, and manage live kitchen orders from a dedicated dashboard.',
  },
]

function MoreContent() {
  const router = useRouter()
  const cart = useAppSelector((state) => state.cart)

  // Responsive Drawer States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  useHistoryModal({
    open: mobileSidebarOpen,
    onClose: () => setMobileSidebarOpen(false),
    modalId: 'mobile-sidebar-more',
  })
  useHistoryModal({
    open: mobileCartOpen,
    onClose: () => setMobileCartOpen(false),
    modalId: 'mobile-cart-more',
  })

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
        <CustomerSidebar activeNav="More" />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 260 } }}
      >
        <CustomerSidebar activeNav="More" onItemClick={() => setMobileSidebarOpen(false)} />
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

        <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 }, flex: 1, maxWidth: 900 }}>
          <Box sx={{ mb: 3.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
              More from DineDirect
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Explore how DineDirect works, customer support, partner onboarding, and FAQs
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* 1. Partner Onboarding Card */}
            <Grid item xs={12} sm={6}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  border: '1.5px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#ea580c',
                    boxShadow: '0 8px 24px -6px rgba(234, 88, 12, 0.15)',
                  },
                }}
              >
                <Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: '#fff7ed',
                      color: '#ea580c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <StorefrontIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    Partner With DineDirect
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 2, lineHeight: 1.5 }}>
                    Grow your food business, receive contactless dine-in & delivery orders, and print customized table QR codes.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  component={Link}
                  href="/register"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    borderColor: '#ea580c',
                    color: '#ea580c',
                    textTransform: 'none',
                    alignSelf: 'flex-start',
                    '&:hover': { bgcolor: '#fff7ed', borderColor: '#c2410c' },
                  }}
                >
                  Register Restaurant
                </Button>
              </Card>
            </Grid>

            {/* 2. QR Dine-in Guide Card */}
            <Grid item xs={12} sm={6}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  border: '1.5px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#0284c7',
                    boxShadow: '0 8px 24px -6px rgba(2, 132, 199, 0.15)',
                  },
                }}
              >
                <Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: '#f0f9ff',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <QrCode2Icon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    Contactless Dine-In QR
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 2, lineHeight: 1.5 }}>
                    No more waiting for physical menus or server bills. Simply scan your table QR to browse dishes, add customized notes, and pay.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  component={Link}
                  href="/home"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    borderColor: '#0284c7',
                    color: '#0284c7',
                    textTransform: 'none',
                    alignSelf: 'flex-start',
                    '&:hover': { bgcolor: '#f0f9ff' },
                  }}
                >
                  Explore Restaurants
                </Button>
              </Card>
            </Grid>
          </Grid>

          {/* Frequently Asked Questions */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HelpOutlineIcon sx={{ color: '#ea580c' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Frequently Asked Questions
              </Typography>
            </Box>

            <Stack spacing={1.5}>
              {FAQS.map((faq, idx) => (
                <Accordion
                  key={idx}
                  elevation={0}
                  sx={{
                    borderRadius: '14px !important',
                    border: '1px solid #e2e8f0',
                    '&:before': { display: 'none' },
                    overflow: 'hidden',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ea580c' }} />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {faq.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                      {faq.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Box>

          {/* Customer Support & Hotline */}
          <Card elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: '#fff7ed', border: '1.5px solid #fed7aa' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <ContactSupportIcon sx={{ fontSize: 40, color: '#ea580c' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Need Immediate Assistance?
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Our customer support team is available daily from 9:00 AM to 11:00 PM for live order questions.
                </Typography>
              </Box>
              <Button
                variant="contained"
                href="mailto:support@dinedirect.com"
                sx={{
                  borderRadius: '10px',
                  fontWeight: 700,
                  bgcolor: '#ea580c',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#c2410c' },
                }}
              >
                Email Support
              </Button>
            </Box>
          </Card>
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

export default function MorePage() {
  return (
    <Suspense fallback={<Box sx={{ p: 4 }}><Skeleton variant="rounded" height={60} /></Box>}>
      <MoreContent />
    </Suspense>
  )
}
