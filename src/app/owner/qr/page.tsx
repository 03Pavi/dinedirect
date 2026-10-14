'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Stack,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Skeleton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import PrintIcon from '@mui/icons-material/Print'
import DownloadIcon from '@mui/icons-material/Download'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SearchIcon from '@mui/icons-material/Search'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StorefrontIcon from '@mui/icons-material/Storefront'
import RefreshIcon from '@mui/icons-material/Refresh'

import Navbar from '@/components/common/navbar'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectIsAuthenticated,
  selectIsOwner,
  selectAuthInitialized,
} from '@/store/selectors/auth-selectors'
import { selectMyRestaurant } from '@/store/selectors/restaurant-selectors'
import { fetchMyRestaurantThunk } from '@/store/thunks/fetch-my-restaurant-thunk'
import QRCode from 'qrcode'
import { QRCodeItem, QRType } from '@/types/qr-types'

const COLOR_OPTIONS = [
  { label: 'Brand Orange', hex: '#ea580c' },
  { label: 'Obsidian Slate', hex: '#0f172a' },
  { label: 'Royal Indigo', hex: '#4338ca' },
  { label: 'Emerald Green', hex: '#059669' },
  { label: 'Ruby Red', hex: '#dc2626' },
]

export default function OwnerQRPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isOwner = useAppSelector(selectIsOwner)
  const authInitialized = useAppSelector(selectAuthInitialized)
  const restaurant = useAppSelector(selectMyRestaurant)

  // QR List & loading
  const [qrs, setQrs] = useState<QRCodeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Creator form state (dynamically suggested from DB)
  const [qrType, setQrType] = useState<QRType>('TABLE')
  const [tableNumber, setTableNumber] = useState('')
  const [tableLabel, setTableLabel] = useState('')
  const [selectedColor, setSelectedColor] = useState('#ea580c')
  const [previewDataUrl, setPreviewDataUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Active / Selected QR for Stand Preview Dialog
  const [selectedQRForStand, setSelectedQRForStand] = useState<QRCodeItem | null>(null)
  const [standDataUrl, setStandDataUrl] = useState('')

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Origin for QR URL generation prioritizing NEXT_PUBLIC_APP_URL
  const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://dinedirect-kappa.vercel.app').replace(/\/+$/, '')
  const [origin, setOrigin] = useState(appBaseUrl)

  useEffect(() => {
    if (appBaseUrl) {
      setOrigin(appBaseUrl)
    } else if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [appBaseUrl])

  // Auth & Initial Data Fetch
  useEffect(() => {
    if (authInitialized) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (!isOwner) {
        router.push('/')
      } else {
        dispatch(fetchMyRestaurantThunk())
      }
    }
  }, [authInitialized, isAuthenticated, isOwner, router, dispatch])

  // Fetch QR codes from DB
  const fetchQRCodes = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/qr')
      const data = await res.json()
      if (data.success && data.qrs) {
        setQrs(data.qrs)

        // Dynamically suggest next table number based on actual DB records
        const existingNumbers = (data.qrs as QRCodeItem[])
          .filter((q) => q.qrType !== 'RESTAURANT' && q.tableNumber.toLowerCase() !== 'menu')
          .map((q) => {
            const match = q.tableNumber.match(/\d+/)
            return match ? parseInt(match[0], 10) : 0
          })
        const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
        setTableNumber(`Table ${maxNum + 1}`)
      }
    } catch (err) {
      console.error('Failed to load QR codes from DB', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (restaurant) {
      fetchQRCodes()
    }
  }, [restaurant])

  // Live QR Preview Generator
  const previewTargetUrl = useMemo(() => {
    if (!restaurant) return ''
    if (qrType === 'RESTAURANT') {
      return `${origin}/home?restaurantId=${encodeURIComponent(restaurant.id)}`
    }
    return `${origin}/home?restaurantId=${encodeURIComponent(restaurant.id)}&table=${encodeURIComponent(tableNumber || 'Table')}`
  }, [origin, restaurant, tableNumber, qrType])

  useEffect(() => {
    if (!previewTargetUrl) return
    QRCode.toDataURL(previewTargetUrl, {
      width: 400,
      margin: 1.5,
      color: {
        dark: selectedColor,
        light: '#ffffff',
      },
    })
      .then((dataUrl) => setPreviewDataUrl(dataUrl))
      .catch((err) => console.error('Error generating preview QR:', err))
  }, [previewTargetUrl, selectedColor])

  // Generate QR for Stand Modal
  useEffect(() => {
    if (!selectedQRForStand) {
      setStandDataUrl('')
      return
    }
    QRCode.toDataURL(selectedQRForStand.url, {
      width: 500,
      margin: 2,
      color: {
        dark: selectedQRForStand.color || '#0f172a',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => setStandDataUrl(dataUrl))
      .catch((err) => console.error('Error generating stand QR:', err))
  }, [selectedQRForStand])

  // Create new QR Code handler
  const handleCreateQR = async () => {
    if (qrType === 'TABLE' && !tableNumber.trim()) {
      setSnackbar({ open: true, message: 'Please enter a table number or label', severity: 'error' })
      return
    }

    const isRestaurantQR = qrType === 'RESTAURANT'
    const effectiveTableNumber = isRestaurantQR ? 'Menu' : tableNumber.trim()
    const effectiveLabel = isRestaurantQR
      ? `${restaurant?.name || 'Restaurant'} — Full Menu QR`
      : (tableLabel.trim() || `${tableNumber.trim()} Dining QR`)

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: effectiveTableNumber,
          label: effectiveLabel,
          color: selectedColor,
          qrType,
        }),
      })
      const data = await res.json()

      if (data.success && data.qr) {
        setQrs([data.qr, ...qrs])
        setSnackbar({
          open: true,
          message: isRestaurantQR
            ? `Created Restaurant Menu QR for ${restaurant?.name}!`
            : `Created QR Code for ${effectiveTableNumber}!`,
          severity: 'success',
        })
        // Increment table number suggestion for table QRs
        if (!isRestaurantQR) {
          const match = tableNumber.match(/Table\s*(\d+)/i)
          if (match) {
            const nextNum = parseInt(match[1], 10) + 1
            setTableNumber(`Table ${nextNum}`)
          }
        }
      } else {
        setSnackbar({ open: true, message: data.error || 'Failed to create QR code', severity: 'error' })
      }
    } catch {
      setSnackbar({ open: true, message: 'Network error creating QR code', severity: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete QR Code
  const handleDeleteQR = async (qrId: string, label: string) => {
    try {
      const res = await fetch(`/api/qr?id=${encodeURIComponent(qrId)}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setQrs(qrs.filter((q) => q.id !== qrId))
        setSnackbar({ open: true, message: `Removed QR Code for ${label}`, severity: 'info' })
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete QR code', severity: 'error' })
    }
  }

  // Simulate/Test Scan (+1 scan tracking)
  const handleTestScan = async (qr: QRCodeItem) => {
    try {
      await fetch('/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrId: qr.id }),
      })
      // Update local state
      setQrs((prev) =>
        prev.map((item) =>
          item.id === qr.id
            ? { ...item, scansCount: item.scansCount + 1, lastScannedAt: new Date().toISOString() }
            : item
        )
      )
      setSnackbar({ open: true, message: `Simulated scan on ${qr.tableNumber} (+1)`, severity: 'success' })
      // Open menu in new tab
      window.open(qr.url, '_blank')
    } catch {
      window.open(qr.url, '_blank')
    }
  }

  // Copy URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard?.writeText(url)
    setSnackbar({ open: true, message: 'Ordering URL copied to clipboard!', severity: 'info' })
  }

  // Download PNG helper
  const handleDownloadPNG = (dataUrl: string, filename: string) => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${filename}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setSnackbar({ open: true, message: `Downloaded ${filename}.png`, severity: 'success' })
  }

  // Filtered QR List
  const filteredQRs = useMemo(() => {
    if (!searchQuery.trim()) return qrs
    const q = searchQuery.toLowerCase().trim()
    return qrs.filter(
      (item) =>
        item.tableNumber.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
    )
  }, [qrs, searchQuery])

  // Analytics Stats (strictly calculated from dynamic DB records)
  const stats = useMemo(() => {
    const totalScans = qrs.reduce((acc, it) => acc + (it.scansCount || 0), 0)
    const activeTables = qrs.length
    const sorted = [...qrs].sort((a, b) => (b.scansCount || 0) - (a.scansCount || 0))
    const topTable = sorted[0]

    return {
      totalScans,
      activeTables,
      topTableName: (topTable && (topTable.scansCount || 0) > 0) ? topTable.tableNumber : 'No Visits Yet',
      topTableScans: topTable?.scansCount || 0,
    }
  }, [qrs])

  if (!authInitialized) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        <Navbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '12px', mb: 3 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3 }}>
            <Skeleton variant="rectangular" height={450} sx={{ borderRadius: '12px' }} />
            <Skeleton variant="rectangular" height={450} sx={{ borderRadius: '12px' }} />
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 }, flexGrow: 1 }}>
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            mb: 3,
            bgcolor: '#ffffff',
            p: { xs: 2, sm: 2.5 },
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {/* Left: Back Link & Title */}
          <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, flexDirection:"column" }}>
            <Button
              component={Link}
              href="/owner/dashboard"
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: '8px',
                color: '#64748b',
                borderColor: '#e2e8f0',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
              }}
            >
              Dashboard
            </Button>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Table QR Studio & Scan Analytics
                </Typography>
                <Chip
                  label={restaurant?.name || 'My Restaurant'}
                  size="small"
                  sx={{
                    bgcolor: '#fff7ed',
                    color: '#ea580c',
                    fontWeight: 800,
                    border: '1px solid #ffedd5',
                    fontSize: '0.72rem',
                    height: 22,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.2 }}>
                Generate table QR codes, customize branding, print acrylic stands, and track customer scans in real-time.
              </Typography>
            </Box>
          </Box>

          {/* Right: Refresh button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={fetchQRCodes}
              startIcon={<RefreshIcon />}
              sx={{
                borderRadius: '8px',
                borderColor: '#e2e8f0',
                color: '#475569',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              Sync Scans
            </Button>
          </Box>
        </Box>

        {/* Analytics KPI Metric Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Card 1: Total Scans */}
          <Box
            sx={{
              p: 2.2,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
                Total Scans
              </Typography>
              <Chip
                label="LIVE"
                size="small"
                sx={{ bgcolor: '#fff7ed', color: '#ea580c', fontWeight: 800, height: 20, fontSize: '0.68rem' }}
              />
            </Box>
            {loading ? (
              <Skeleton variant="text" width={65} height={44} sx={{ mt: 0.5, borderRadius: '4px' }} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mt: 1 }}>
                {stats.totalScans}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              Across all dining tables
            </Typography>
          </Box>

          {/* Card 2: Active Tables */}
          <Box
            sx={{
              p: 2.2,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#4338ca', textTransform: 'uppercase' }}>
                Active QR
              </Typography>
              <Chip
                label="SEATS"
                size="small"
                sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 800, height: 20, fontSize: '0.68rem' }}
              />
            </Box>
            {loading ? (
              <Skeleton variant="text" width={45} height={44} sx={{ mt: 0.5, borderRadius: '4px' }} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mt: 1 }}>
                {stats.activeTables}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              Assigned dining areas
            </Typography>
          </Box>

          {/* Card 3: Top Traffic Table */}
          <Box
            sx={{
              p: 2.2,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                🔥 Most Visited
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" width={65} height={20} sx={{ borderRadius: '10px' }} />
              ) : (
                <Chip
                  label={`${stats.topTableScans} scans`}
                  size="small"
                  sx={{
                    bgcolor: stats.topTableScans > 0 ? '#f0fdf4' : '#f8fafc',
                    color: stats.topTableScans > 0 ? '#16a34a' : '#64748b',
                    fontWeight: 800,
                    height: 20,
                    fontSize: '0.68rem',
                  }}
                />
              )}
            </Box>
            {loading ? (
              <Skeleton variant="text" width={85} height={38} sx={{ mt: 0.5, borderRadius: '4px' }} />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 1 }}>
                {stats.topTableName}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {stats.topTableScans > 0 ? 'Highest scan engagement' : 'Scan a QR to register live traffic'}
            </Typography>
          </Box>

          {/* Card 4: Restaurant ID */}
          <Box
            sx={{
              p: 2.2,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Restaurant ID
              </Typography>
              <Tooltip title="Copy Restaurant ID">
                <IconButton
                  size="small"
                  onClick={() => {
                    if (restaurant) {
                      navigator.clipboard?.writeText(restaurant.id)
                      setSnackbar({ open: true, message: 'Restaurant ID copied!', severity: 'info' })
                    }
                  }}
                  sx={{ p: 0.3 }}
                >
                  <ContentCopyIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                </IconButton>
              </Tooltip>
            </Box>
            {loading || !restaurant ? (
              <Skeleton variant="text" width={110} height={26} sx={{ mt: 1, borderRadius: '4px' }} />
            ) : (
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mt: 1, fontFamily: 'monospace' }}>
                #{restaurant?.id ? restaurant.id.slice(0, 12) : 'Loading...'}...
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              Embedded in all QR tags
            </Typography>
          </Box>
        </Box>

        {/* Main 2-Column Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: 3 }}>
          {/* LEFT COLUMN: Create & Customize QR Code */}
          <Box>
            <Card
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#fff7ed',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ffedd5',
                  }}
                >
                  <QrCode2Icon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                    Generate QR Code
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Create QR for a table or your full restaurant menu
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5, borderColor: '#f1f5f9' }} />

              {/* QR Type Toggle */}
              <Box
                sx={{
                  display: 'flex',
                  bgcolor: '#f1f5f9',
                  p: 0.5,
                  borderRadius: '12px',
                  mb: 2.5,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Button
                  fullWidth
                  size="small"
                  onClick={() => setQrType('TABLE')}
                  startIcon={<QrCode2Icon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: '10px',
                    py: 1,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    bgcolor: qrType === 'TABLE' ? '#ea580c' : 'transparent',
                    color: qrType === 'TABLE' ? '#ffffff' : '#64748b',
                    boxShadow: qrType === 'TABLE' ? '0 2px 8px rgba(234,88,12,0.3)' : 'none',
                    '&:hover': {
                      bgcolor: qrType === 'TABLE' ? '#c2410c' : '#e2e8f0',
                    },
                  }}
                >
                  Table QR
                </Button>
                <Button
                  fullWidth
                  size="small"
                  onClick={() => setQrType('RESTAURANT')}
                  startIcon={<StorefrontIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: '10px',
                    py: 1,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    bgcolor: qrType === 'RESTAURANT' ? '#ea580c' : 'transparent',
                    color: qrType === 'RESTAURANT' ? '#ffffff' : '#64748b',
                    boxShadow: qrType === 'RESTAURANT' ? '0 2px 8px rgba(234,88,12,0.3)' : 'none',
                    '&:hover': {
                      bgcolor: qrType === 'RESTAURANT' ? '#c2410c' : '#e2e8f0',
                    },
                  }}
                >
                  Menu
                </Button>
              </Box>

              {/* Form Controls */}
              <Stack spacing={2} sx={{ mb: 3 }}>
                {qrType === 'TABLE' && (
                  <>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.6, display: 'block' }}>
                        Table Number / Label:
                      </Typography>
                      <TextField
                        size="small"
                        fullWidth
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="e.g. Table 1, Table 8, Patio 3, Counter"
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.6, display: 'block' }}>
                        Dining Area / Zone:
                      </Typography>
                      <TextField
                        size="small"
                        fullWidth
                        value={tableLabel}
                        onChange={(e) => setTableLabel(e.target.value)}
                        placeholder="e.g. Indoor AC Dining, Rooftop, Garden Lawn"
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                        }}
                      />
                    </Box>
                  </>
                )}

                {qrType === 'RESTAURANT' && (
                  <Box
                    sx={{
                      bgcolor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '10px',
                      p: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <StorefrontIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af' }}>
                        {restaurant?.name || 'Your Restaurant'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                      This QR opens your full menu listing. Share it on social media, business cards, flyers, or your storefront. Anyone who scans it can browse your menu and place orders directly.
                    </Typography>
                  </Box>
                )}

                {/* Color Palette Selector */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.8, display: 'block' }}>
                    QR Brand Color:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {COLOR_OPTIONS.map((c) => (
                      <Chip
                        key={c.hex}
                        label={c.label}
                        onClick={() => setSelectedColor(c.hex)}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: '8px',
                          bgcolor: selectedColor === c.hex ? c.hex : '#f8fafc',
                          color: selectedColor === c.hex ? '#ffffff' : '#334155',
                          border: `1.5px solid ${selectedColor === c.hex ? c.hex : '#e2e8f0'}`,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: selectedColor === c.hex ? c.hex : '#f1f5f9',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Stack>

              {/* Live QR Preview Box */}
              <Box
                sx={{
                  bgcolor: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '12px',
                  p: 2.5,
                  textAlign: 'center',
                  mb: 3,
                  position: 'relative',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {qrType === 'RESTAURANT' ? 'Menu QR Preview' : 'Live Stand Preview'}
                </Typography>

                {/* QR Visual */}
                <Box sx={{ my: 1.5, display: 'flex', justifyContent: 'center' }}>
                  {previewDataUrl ? (
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0',
                        display: 'inline-block',
                      }}
                    >
                      <Box
                        component="img"
                        src={previewDataUrl}
                        alt="QR Code Preview"
                        sx={{
                          width: 170,
                          height: 170,
                          display: 'block',
                        }}
                      />
                    </Box>
                  ) : (
                    <Skeleton variant="rectangular" width={170} height={170} sx={{ borderRadius: '12px' }} />
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {qrType === 'RESTAURANT' ? (restaurant?.name || 'Restaurant') : (tableNumber || 'Table')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {qrType === 'RESTAURANT'
                    ? 'Scan to Browse Menu & Order Online'
                    : 'Scan to View Menu & Place Order'}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={1.2} sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting || (qrType === 'TABLE' && !tableNumber.trim())}
                  onClick={handleCreateQR}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#ea580c',
                    textTransform: 'none',
                    fontWeight: 800,
                    py: 1,
                    '&:hover': { bgcolor: '#c2410c' },
                  }}
                >
                  {isSubmitting
                    ? 'Generating...'
                    : qrType === 'RESTAURANT'
                      ? `Save Menu QR`
                      : `Save & Add ${tableNumber || 'Table'} QR`}
                </Button>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadPNG(previewDataUrl, `${tableNumber || 'table'}-qr`)}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderColor: '#e2e8f0',
                      color: '#475569',
                    }}
                  >
                    Download PNG
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<PrintIcon />}
                    onClick={() => {
                      setSelectedQRForStand({
                        id: 'preview',
                        restaurantId: restaurant?.id || '',
                        tableNumber: tableNumber || 'Table',
                        label: tableLabel || 'Dining Table',
                        code: `DINE-${tableNumber.replace(/\s+/g, '').toUpperCase()}`,
                        url: previewTargetUrl,
                        color: selectedColor,
                        scansCount: 0,
                        qrType: qrType,
                        createdAt: new Date().toISOString(),
                        lastScannedAt: null,
                      })
                    }}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderColor: '#e2e8f0',
                      color: '#475569',
                    }}
                  >
                    Print Stand
                  </Button>
                </Box>
              </Stack>
            </Card>
          </Box>

          {/* RIGHT COLUMN: Existing QR Codes & Scan Performance */}
          <Box>
            <Card
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Top Row: Title & Search Filter */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1.5,
                  mb: 2.5,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                    Active Table QR Codes {loading ? <Skeleton variant="rounded" width={32} height={22} sx={{ borderRadius: '6px' }} /> : `(${filteredQRs.length})`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Monitor scan volume per table and print stands
                  </Typography>
                </Box>

                <TextField
                  size="small"
                  placeholder="Filter table..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    maxWidth: 220,
                    '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                  }}
                />
              </Box>

              <Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />

              {/* QR Cards List */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
                {loading ? (
                  <Stack spacing={1.8}>
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <Card
                        key={idx}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          bgcolor: '#ffffff',
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: 'space-between',
                          gap: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                          <Skeleton variant="rounded" width={10} height={48} sx={{ borderRadius: '4px', flexShrink: 0 }} />
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Skeleton variant="text" width={90} height={24} sx={{ borderRadius: '4px' }} />
                              <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: '4px' }} />
                            </Box>
                            <Skeleton variant="text" width="60%" height={18} sx={{ borderRadius: '4px' }} />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="rounded" width={85} height={26} sx={{ borderRadius: '16px' }} />
                          <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: '8px' }} />
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                ) : filteredQRs.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                    <Typography sx={{ fontWeight: 600 }}>No QR codes found</Typography>
                    <Typography variant="caption">Use the generator on the left to add table QR codes</Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.8}>
                    {filteredQRs.map((item) => (
                      <Card
                        key={item.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          bgcolor: '#ffffff',
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: 'space-between',
                          gap: 2,
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: item.color || '#ea580c',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          },
                        }}
                      >
                        {/* Left: Table details & color accent */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 48,
                              borderRadius: '4px',
                              bgcolor: item.color || '#ea580c',
                              flexShrink: 0,
                            }}
                          />
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                {item.tableNumber}
                              </Typography>
                              <Chip
                                label={item.code}
                                size="small"
                                sx={{
                                  fontSize: '0.68rem',
                                  height: 20,
                                  fontFamily: 'monospace',
                                  bgcolor: '#f1f5f9',
                                  color: '#475569',
                                  fontWeight: 700,
                                }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}>
                              {item.label}
                            </Typography>
                            {item.lastScannedAt ? (
                              <Typography variant="caption" sx={{ color: '#059669', fontSize: '0.7rem', display: 'block', fontWeight: 600 }}>
                                Scanned {new Date(item.lastScannedAt).toLocaleDateString()} {new Date(item.lastScannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            ) : (
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block' }}>
                                Not scanned yet
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Center: Scans counter badge */}
                        <Box sx={{ textAlign: { xs: 'left', sm: 'center' }, pl: { xs: 2.5, sm: 0 } }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.6,
                              px: 1.5,
                              py: 0.6,
                              borderRadius: '20px',
                              bgcolor: item.scansCount > 0 ? '#fff7ed' : '#f8fafc',
                              border: '1px solid',
                              borderColor: item.scansCount > 0 ? '#fed7aa' : '#e2e8f0',
                            }}
                          >
                            <WhatshotIcon sx={{ fontSize: 16, color: item.scansCount > 0 ? '#ea580c' : '#94a3b8' }} />
                            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                              {item.scansCount}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                              scans
                            </Typography>
                          </Box>
                        </Box>

                        {/* Right: Quick actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                          {/* Test Scan button */}
                          <Tooltip title="Test Scan & Open Menu (+1 scan)">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleTestScan(item)}
                              startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                borderRadius: '6px',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                py: 0.4,
                                px: 1,
                                borderColor: '#e2e8f0',
                                color: '#0f172a',
                              }}
                            >
                              Test (+1)
                            </Button>
                          </Tooltip>

                          {/* Print Stand button */}
                          <Tooltip title="View & Print Table Stand">
                            <IconButton
                              size="small"
                              onClick={() => setSelectedQRForStand(item)}
                              sx={{ border: '1px solid #e2e8f0', borderRadius: '6px', p: 0.6 }}
                            >
                              <PrintIcon sx={{ fontSize: 16, color: '#475569' }} />
                            </IconButton>
                          </Tooltip>

                          {/* Copy URL button */}
                          <Tooltip title="Copy Menu Link">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyUrl(item.url)}
                              sx={{ border: '1px solid #e2e8f0', borderRadius: '6px', p: 0.6 }}
                            >
                              <ContentCopyIcon sx={{ fontSize: 16, color: '#475569' }} />
                            </IconButton>
                          </Tooltip>

                          {/* Delete button */}
                          <Tooltip title="Remove QR Code">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteQR(item.id, item.tableNumber)}
                              sx={{ border: '1px solid #fee2e2', borderRadius: '6px', p: 0.6, color: '#ef4444' }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            </Card>
          </Box>
        </Box>
      </Container>

      {/* PRINTABLE TABLE STAND MODAL */}
      <Dialog
        open={Boolean(selectedQRForStand)}
        onClose={() => setSelectedQRForStand(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
      >
        {selectedQRForStand && (
          <>
            <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Printable Table Stand Card
              </Typography>
              <Chip
                label={selectedQRForStand.tableNumber}
                size="small"
                sx={{
                  bgcolor: '#fff7ed',
                  color: '#ea580c',
                  fontWeight: 800,
                  border: '1px solid #ffedd5',
                }}
              />
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              {/* Beautiful Table Tent Stand Design */}
              <Box
                id="printable-table-tent"
                sx={{
                  bgcolor: '#ffffff',
                  border: '2px solid #0f172a',
                  borderRadius: '16px',
                  p: 3,
                  textAlign: 'center',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  position: 'relative',
                }}
              >
                {/* Brand Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      bgcolor: '#ea580c',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    🍽️
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {restaurant?.name || 'DineDirect'}
                  </Typography>
                </Box>

                {/* Table Badge */}
                <Chip
                  label={selectedQRForStand.tableNumber.toUpperCase()}
                  sx={{
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    letterSpacing: '0.05em',
                    px: 1,
                    mb: 2,
                  }}
                />

                {/* QR Code */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {standDataUrl ? (
                    <Box
                      component="img"
                      src={standDataUrl}
                      alt="Table QR"
                      sx={{
                        width: 190,
                        height: 190,
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        p: 1,
                      }}
                    />
                  ) : (
                    <Skeleton variant="rectangular" width={190} height={190} sx={{ borderRadius: '8px' }} />
                  )}
                </Box>

                {/* Call to action instruction */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                  SCAN TO VIEW MENU & ORDER
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.4 }}>
                  Point your phone camera or Google Lens to view full menu with photos and order directly to this table.
                </Typography>
                <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 800, mt: 1, display: 'block' }}>
                  No app download needed • Instant Service
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadPNG(standDataUrl, `${selectedQRForStand.tableNumber}-stand-qr`)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                Download PNG
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                >
                  Print Stand
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setSelectedQRForStand(null)}
                  sx={{ borderRadius: '8px', bgcolor: '#0f172a', textTransform: 'none', fontWeight: 700 }}
                >
                  Done
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar feedback */}
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
