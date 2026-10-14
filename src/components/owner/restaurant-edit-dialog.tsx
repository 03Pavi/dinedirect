'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  Typography,
  Alert,
  Box,
  useTheme,
  useMediaQuery,
  Chip,
  InputAdornment,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import ImageIcon from '@mui/icons-material/Image'

import { Restaurant } from '@/types/restaurant-types'
import { useAppDispatch } from '@/store/hooks'
import { updateRestaurantThunk } from '@/store/thunks/update-restaurant-thunk'
import { useHistoryModal } from '@/hooks/use-history-modal'

const CUISINE_OPTIONS = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Italian',
  'Fast Food',
  'Biryani',
  'Desserts',
  'Beverages',
  'Continental',
  'Street Food',
  'Mughlai',
  'Tandoor',
]

interface RestaurantEditDialogProps {
  open: boolean
  onClose: () => void
  restaurant: Restaurant
  onSuccess?: (updated: Restaurant) => void
}

export function RestaurantEditDialog({
  open,
  onClose,
  restaurant,
  onSuccess,
}: RestaurantEditDialogProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useAppDispatch()

  const { handleClose: handleSafeClose } = useHistoryModal({
    open,
    onClose,
    modalId: 'restaurant-edit-dialog',
  })

  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [openingTime, setOpeningTime] = useState('09:00')
  const [closingTime, setClosingTime] = useState('22:00')
  const [deliveryFee, setDeliveryFee] = useState('30')
  const [minOrder, setMinOrder] = useState('100')
  const [cuisineList, setCuisineList] = useState<string[]>([])
  const [customCuisine, setCustomCuisine] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [fssaiNumber, setFssaiNumber] = useState('')

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form state when restaurant changes or modal opens
  useEffect(() => {
    if (restaurant && open) {
      setName(restaurant.name || '')
      setDescription(restaurant.description || '')
      setPhone(restaurant.phone || '')
      setAddress(restaurant.address || '')
      setCity(restaurant.city || '')
      setOpeningTime(restaurant.openingTime || '09:00')
      setClosingTime(restaurant.closingTime || '22:00')
      setDeliveryFee(String(restaurant.deliveryFee ?? 30))
      setMinOrder(String(restaurant.minOrder ?? 100))

      let cuisines: string[] = []
      if (Array.isArray(restaurant.cuisine)) {
        cuisines = [...restaurant.cuisine]
      } else if (typeof restaurant.cuisine === 'string') {
        try {
          cuisines = JSON.parse(restaurant.cuisine)
        } catch {
          cuisines = [restaurant.cuisine]
        }
      }
      setCuisineList(cuisines)
      setImageUrl(restaurant.imageUrl || '')
      setFssaiNumber(restaurant.fssaiNumber || '')

      setErrors({})
      setServerError(null)
      setCustomCuisine('')
    }
  }, [restaurant, open])

  const toggleCuisine = (item: string) => {
    setCuisineList((prev) => {
      const exists = prev.includes(item)
      const next = exists ? prev.filter((c) => c !== item) : [...prev, item]
      if (next.length > 0 && errors.cuisine) {
        setErrors((prevErr) => {
          const { cuisine: _, ...rest } = prevErr
          return rest
        })
      }
      return next
    })
  }

  const handleAddCustomCuisine = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = customCuisine.trim()
    if (!trimmed) return

    if (!cuisineList.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCuisineList((prev) => [...prev, trimmed])
      if (errors.cuisine) {
        setErrors((prevErr) => {
          const { cuisine: _, ...rest } = prevErr
          return rest
        })
      }
    }
    setCustomCuisine('')
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Restaurant name must be at least 2 characters'
    }
    if (!description.trim() || description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters'
    }
    if (!phone.trim() || phone.trim().length < 10) {
      newErrors.phone = 'Valid 10-digit phone number is required'
    }
    if (!address.trim() || address.trim().length < 4) {
      newErrors.address = 'Valid address is required'
    }
    if (!city.trim() || city.trim().length < 2) {
      newErrors.city = 'City is required'
    }
    if (cuisineList.length === 0) {
      newErrors.cuisine = 'Please select or add at least one cuisine'
    }

    const timeRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/
    if (!timeRegex.test(openingTime)) {
      newErrors.openingTime = 'Format HH:MM (e.g. 09:00)'
    }
    if (!timeRegex.test(closingTime)) {
      newErrors.closingTime = 'Format HH:MM (e.g. 22:00)'
    }

    const parsedDelivery = Number(deliveryFee)
    if (isNaN(parsedDelivery) || parsedDelivery < 0) {
      newErrors.deliveryFee = 'Delivery fee cannot be negative'
    }

    const parsedMinOrder = Number(minOrder)
    if (isNaN(parsedMinOrder) || parsedMinOrder < 0) {
      newErrors.minOrder = 'Minimum order cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const resultAction = await dispatch(
        updateRestaurantThunk({
          id: restaurant.id,
          name: name.trim(),
          description: description.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          openingTime,
          closingTime,
          deliveryFee: Number(deliveryFee) || 0,
          minOrder: Number(minOrder) || 0,
          cuisine: cuisineList,
          imageUrl: imageUrl.trim() || undefined,
          fssaiNumber: fssaiNumber.trim() || undefined,
        })
      )

      if (updateRestaurantThunk.fulfilled.match(resultAction)) {
        onSuccess?.(resultAction.payload)
        onClose()
      } else {
        setServerError(resultAction.payload || 'Failed to update restaurant details')
      }
    } catch (err: any) {
      setServerError(err?.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleSafeClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '16px',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: isMobile ? '100vh' : '90vh',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f1f5f9',
          bgcolor: '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isMobile ? (
            <IconButton onClick={handleSafeClose} disabled={isSubmitting} edge="start" size="small">
              <ArrowBackIcon sx={{ color: '#0f172a' }} />
            </IconButton>
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c',
              }}
            >
              <StorefrontIcon />
            </Box>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Edit Restaurant Details
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              Update your outlet name, timings, delivery settings and specialties
            </Typography>
          </Box>
        </Box>

        {isMobile ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#ea580c',
              '&:hover': { bgcolor: '#c2410c' },
              fontWeight: 800,
              borderRadius: '8px',
              textTransform: 'none',
              px: 2,
            }}
          >
            {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Save'}
          </Button>
        ) : (
          <IconButton onClick={handleSafeClose} disabled={isSubmitting} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      {/* Dialog Body */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
        <DialogContent
          dividers
          sx={{
            p: { xs: 2, sm: 3 },
            flexGrow: 1,
            overflowY: 'auto',
            bgcolor: '#ffffff',
          }}
        >
          <Stack spacing={3.5}>
            {serverError && (
              <Alert severity="error" onClose={() => setServerError(null)} sx={{ borderRadius: '10px' }}>
                {serverError}
              </Alert>
            )}

            {/* SECTION 1: Basic Information */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <StorefrontIcon sx={{ color: '#ea580c', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Basic Information
                </Typography>
              </Box>

              <Stack spacing={2}>
                <TextField
                  label="Restaurant Name *"
                  placeholder="e.g. Swaad Ghar Ka"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                  }}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  fullWidth
                  size="small"
                  InputProps={{ sx: { bgcolor: '#ffffff', borderRadius: '8px' } }}
                />

                <TextField
                  label="Tagline / Description *"
                  placeholder="e.g. Authentic homestyle meals crafted with love"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }))
                  }}
                  error={Boolean(errors.description)}
                  helperText={errors.description}
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  InputProps={{ sx: { bgcolor: '#ffffff', borderRadius: '8px' } }}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Phone Number *"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
                    }}
                    error={Boolean(errors.phone)}
                    helperText={errors.phone}
                    fullWidth
                    size="small"
                    InputProps={{ sx: { bgcolor: '#ffffff', borderRadius: '8px' } }}
                  />

                  <TextField
                    label="Cover Image URL (Optional)"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: { bgcolor: '#ffffff', borderRadius: '8px' },
                      startAdornment: (
                        <InputAdornment position="start">
                          <ImageIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* SECTION 2: Location & Compliance */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOnIcon sx={{ color: '#ea580c', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Location & Compliance
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Full Address *"
                    placeholder="e.g. Shop 12, Rajpur Road"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      if (errors.address) setErrors((prev) => ({ ...prev, address: '' }))
                    }}
                    error={Boolean(errors.address)}
                    helperText={errors.address}
                    fullWidth
                    size="small"
                    InputProps={{ sx: { bgcolor: '#ffffff', borderRadius: '8px' } }}
                  />

                  <TextField
                    label="City *"
                    placeholder="e.g. Dehradun"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value)
                      if (errors.city) setErrors((prev) => ({ ...prev, city: '' }))
                    }}
                    error={Boolean(errors.city)}
                    helperText={errors.city}
                    fullWidth
                    size="small"
                    InputProps={{ sx: { bgcolor: '#ffffff', borderRadius: '8px' } }}
                  />
                </Box>

                <TextField
                  label="FSSAI Registration / License Number (Optional)"
                  placeholder="14-digit FSSAI Number"
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  fullWidth
                  size="small"
                  InputProps={{
                    sx: { bgcolor: '#ffffff', borderRadius: '8px' },
                    startAdornment: (
                      <InputAdornment position="start">
                        <VerifiedUserOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Paper>

            {/* SECTION 3: Operating Hours & Delivery */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccessTimeIcon sx={{ color: '#ea580c', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Hours & Delivery Pricing
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Opens At *"
                  type="time"
                  value={openingTime}
                  onChange={(e) => {
                    setOpeningTime(e.target.value)
                    if (errors.openingTime) setErrors((prev) => ({ ...prev, openingTime: '' }))
                  }}
                  error={Boolean(errors.openingTime)}
                  helperText={errors.openingTime}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { bgcolor: '#ffffff', borderRadius: '8px' } }}
                />

                <TextField
                  label="Closes At *"
                  type="time"
                  value={closingTime}
                  onChange={(e) => {
                    setClosingTime(e.target.value)
                    if (errors.closingTime) setErrors((prev) => ({ ...prev, closingTime: '' }))
                  }}
                  error={Boolean(errors.closingTime)}
                  helperText={errors.closingTime}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { bgcolor: '#ffffff', borderRadius: '8px' } }}
                />

                <TextField
                  label="Delivery Fee (₹) *"
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => {
                    setDeliveryFee(e.target.value)
                    if (errors.deliveryFee) setErrors((prev) => ({ ...prev, deliveryFee: '' }))
                  }}
                  error={Boolean(errors.deliveryFee)}
                  helperText={errors.deliveryFee}
                  fullWidth
                  size="small"
                  InputProps={{
                    sx: { bgcolor: '#ffffff', borderRadius: '8px' },
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />

                <TextField
                  label="Min Order (₹) *"
                  type="number"
                  value={minOrder}
                  onChange={(e) => {
                    setMinOrder(e.target.value)
                    if (errors.minOrder) setErrors((prev) => ({ ...prev, minOrder: '' }))
                  }}
                  error={Boolean(errors.minOrder)}
                  helperText={errors.minOrder}
                  fullWidth
                  size="small"
                  InputProps={{
                    sx: { bgcolor: '#ffffff', borderRadius: '8px' },
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Box>
            </Paper>

            {/* SECTION 4: Cuisines & Specialties */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RestaurantMenuIcon sx={{ color: '#ea580c', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Cuisines & Specialties *
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: cuisineList.length > 0 ? '#166534' : '#64748b' }}>
                  {cuisineList.length} selected
                </Typography>
              </Box>

              {errors.cuisine && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                  {errors.cuisine}
                </Alert>
              )}

              {/* Predefined Chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                {CUISINE_OPTIONS.map((item) => {
                  const selected = cuisineList.includes(item)
                  return (
                    <Chip
                      key={item}
                      label={item}
                      onClick={() => toggleCuisine(item)}
                      icon={selected ? <CheckCircleIcon sx={{ fontSize: '16px !important' }} /> : undefined}
                      sx={{
                        borderRadius: '20px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        py: 0.5,
                        px: 0.5,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        bgcolor: selected ? '#ea580c' : '#ffffff',
                        color: selected ? '#ffffff' : '#475569',
                        border: '1px solid',
                        borderColor: selected ? '#ea580c' : '#cbd5e1',
                        '&:hover': {
                          bgcolor: selected ? '#c2410c' : '#f1f5f9',
                        },
                      }}
                    />
                  )
                })}
              </Box>

              {/* Custom Cuisine Add */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  placeholder="Add another cuisine (e.g. Kashmiri, Bakery)"
                  value={customCuisine}
                  onChange={(e) => setCustomCuisine(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomCuisine()
                    }
                  }}
                  size="small"
                  fullWidth
                  InputProps={{ sx: { bgcolor: '#ffffff', borderRadius: '8px' } }}
                />
                <Button
                  onClick={handleAddCustomCuisine}
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '8px',
                    borderColor: '#cbd5e1',
                    color: '#334155',
                    '&:hover': { borderColor: '#ea580c', color: '#ea580c' },
                  }}
                >
                  Add
                </Button>
              </Box>

              {/* Custom Cuisines Selected that aren't in preset list */}
              {cuisineList.some((c) => !CUISINE_OPTIONS.includes(c)) && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" sx={{ width: '100%', color: '#64748b', fontWeight: 600 }}>
                    Custom additions:
                  </Typography>
                  {cuisineList
                    .filter((c) => !CUISINE_OPTIONS.includes(c))
                    .map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        onDelete={() => toggleCuisine(item)}
                        sx={{
                          borderRadius: '20px',
                          fontWeight: 700,
                          bgcolor: '#fff7ed',
                          color: '#ea580c',
                          borderColor: '#ffedd5',
                        }}
                      />
                    ))}
                </Box>
              )}
            </Paper>
          </Stack>
        </DialogContent>

        {/* Dialog Actions (Desktop & Tablet) */}
        {!isMobile && (
          <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid #f1f5f9', bgcolor: '#fafafa', justifyContent: 'space-between' }}>
            <Button onClick={handleSafeClose} disabled={isSubmitting} color="inherit" sx={{ fontWeight: 600, textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                bgcolor: '#ea580c',
                '&:hover': { bgcolor: '#c2410c' },
                px: 4,
                py: 1,
                fontWeight: 800,
                borderRadius: '10px',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Saving Changes...</span>
                </Box>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogActions>
        )}
      </form>
    </Dialog>
  )
}
