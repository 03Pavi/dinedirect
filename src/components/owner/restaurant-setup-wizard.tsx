'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

import { restaurantSchema, RestaurantInput } from '@/schemas/restaurant-schema'

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
]

const STEPS = [
  { id: 0, label: 'Basic Info', icon: StorefrontIcon, description: 'Name, phone & tagline' },
  { id: 1, label: 'Location & Cuisines', icon: LocationOnIcon, description: 'Address & specialties' },
  { id: 2, label: 'Hours & Rules', icon: AccessTimeIcon, description: 'Timings & pricing' },
]

export interface RestaurantSetupWizardProps {
  onSubmit: (data: RestaurantInput) => Promise<void>
  isSubmitting: boolean
  formError: string | null
}

export function RestaurantSetupWizard({
  onSubmit,
  isSubmitting,
  formError,
}: RestaurantSetupWizardProps) {
  const [activeStep, setActiveStep] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RestaurantInput>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      phone: '',
      cuisine: ['North Indian'],
      openingTime: '09:00',
      closingTime: '22:00',
      deliveryFee: 30,
      minOrder: 100,
      imageUrl: '',
    },
  })

  const selectedCuisines = watch('cuisine') || []

  const toggleCuisine = (cuisineName: string) => {
    const current = [...selectedCuisines]
    const idx = current.indexOf(cuisineName)
    if (idx > -1) {
      if (current.length > 1) {
        current.splice(idx, 1)
      }
    } else {
      current.push(cuisineName)
    }
    setValue('cuisine', current, { shouldValidate: true })
  }

  const handleNext = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (activeStep === 0) {
      const valid = await trigger(['name', 'phone', 'description'])
      if (!valid) return
    } else if (activeStep === 1) {
      const valid = await trigger(['address', 'city', 'cuisine'])
      if (!valid) return
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleBack = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        maxWidth: 760,
        mx: 'auto',
        bgcolor: '#ffffff',
        width: '100%',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header Title */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <StorefrontIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Register Your Restaurant
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep].description}
            </Typography>
          </Box>
        </Stack>

        {/* Multi-Screen Stepper Progress Bar */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
            gap: 1,
            mb: 3,
          }}
        >
          {STEPS.map((step) => {
            const isActive = activeStep === step.id
            const isCompleted = activeStep > step.id
            const StepIconComponent = step.icon

            return (
              <Box
                key={step.id}
                onClick={() => {
                  if (step.id < activeStep) setActiveStep(step.id)
                }}
                sx={{
                  p: { xs: 1, sm: 1.25 },
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: isActive ? '#f97316' : isCompleted ? '#fdba74' : '#e2e8f0',
                  bgcolor: isActive ? '#fff7ed' : isCompleted ? '#fffaf5' : '#f8fafc',
                  cursor: isCompleted ? 'pointer' : 'default',
                  transition: 'all 0.15s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '4px',
                    bgcolor: isActive ? '#f97316' : isCompleted ? '#ea580c' : '#cbd5e1',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : step.id + 1}
                </Box>
                <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#f97316' : '#475569',
                      display: 'block',
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>

        {formError && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px', fontSize: '0.85rem' }}>
            {formError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* STEP 0: BASIC INFORMATION */}
          {activeStep === 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                id="name"
                label="Restaurant Name"
                placeholder="e.g. Spice Symphony"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />

              <TextField
                fullWidth
                size="small"
                id="phone"
                label="Contact Phone"
                placeholder="10-digit phone number"
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />

              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <TextField
                  fullWidth
                  size="small"
                  id="description"
                  label="Brief Description / Tagline"
                  placeholder="Authentic dining experience with handcrafted spices and flavors..."
                  multiline
                  rows={3}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                  }}
                />
              </Box>
            </Box>
          )}

          {/* STEP 1: LOCATION & CUISINES */}
          {activeStep === 1 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                id="address"
                label="Complete Street Address"
                placeholder="Shop 12, High Street Food Plaza"
                {...register('address')}
                error={!!errors.address}
                helperText={errors.address?.message}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />

              <TextField
                fullWidth
                size="small"
                id="city"
                label="City"
                placeholder="e.g. Mumbai"
                {...register('city')}
                error={!!errors.city}
                helperText={errors.city?.message}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />

              {/* Cuisines Selection */}
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, color: '#334155', display: 'block' }}>
                  CUISINES (SELECT AT LEAST ONE)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {CUISINE_OPTIONS.map((c) => {
                    const isSelected = selectedCuisines.includes(c)
                    return (
                      <Chip
                        key={c}
                        label={c}
                        onClick={() => toggleCuisine(c)}
                        sx={{
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          height: 30,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: isSelected ? '#f97316' : '#cbd5e1',
                          bgcolor: isSelected ? '#f97316' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#334155',
                          '&:hover': {
                            bgcolor: isSelected ? '#ea580c' : '#f1f5f9',
                          },
                        }}
                      />
                    )
                  })}
                </Box>
                {errors.cuisine && (
                  <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}>
                    {errors.cuisine.message}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* STEP 2: OPERATING HOURS & ORDER RULES */}
          {activeStep === 2 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                id="openingTime"
                label="Opening Time"
                placeholder="09:00"
                {...register('openingTime')}
                error={!!errors.openingTime}
                helperText={errors.openingTime?.message}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />

              <TextField
                fullWidth
                size="small"
                id="closingTime"
                label="Closing Time"
                placeholder="22:00"
                {...register('closingTime')}
                error={!!errors.closingTime}
                helperText={errors.closingTime?.message}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />

              <TextField
                fullWidth
                size="small"
                id="deliveryFee"
                label="Delivery Fee (₹)"
                type="number"
                {...register('deliveryFee', { valueAsNumber: true })}
                error={!!errors.deliveryFee}
                helperText={errors.deliveryFee?.message}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />

              <TextField
                fullWidth
                size="small"
                id="minOrder"
                label="Min Order (₹)"
                type="number"
                {...register('minOrder', { valueAsNumber: true })}
                error={!!errors.minOrder}
                helperText={errors.minOrder?.message}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />
            </Box>
          )}

          <Divider sx={{ my: 2.5, borderColor: '#f1f5f9' }} />

          {/* Stepper Navigation Buttons */}
          <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
            {activeStep > 0 ? (
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#cbd5e1',
                  px: 2.5,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                Back
              </Button>
            ) : (
              <Box />
            )}

            {activeStep < STEPS.length - 1 ? (
              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: '8px',
                  bgcolor: '#f97316',
                  color: '#ffffff',
                  px: 3,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  '&:hover': { bgcolor: '#ea580c' },
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <AddCircleOutlineIcon />}
                sx={{
                  borderRadius: '8px',
                  bgcolor: '#f97316',
                  color: '#ffffff',
                  px: 3.5,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  '&:hover': { bgcolor: '#ea580c' },
                }}
              >
                {isSubmitting ? 'Registering...' : 'Complete'}
              </Button>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}
export default RestaurantSetupWizard
