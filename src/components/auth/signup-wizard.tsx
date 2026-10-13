'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { registerThunk } from '@/store/thunks/register-thunk'
import {
  selectAuthLoading,
  selectCurrentUser,
  selectIsAuthenticated,
} from '@/store/selectors/auth-selectors'

import { useThemeMode } from './auth-theme-context'
import { SharpPaper, SharpButton, SharpStepConnector } from './auth-ui-primitives'
import { RoleSelectionStep } from './role-selection-step'
import { ProfileDetailsStep } from './profile-details-step'
import { SecurityCredentialsStep } from './security-credentials-step'

const STEP_LABELS = ['ACCOUNT TYPE', 'PROFILE DETAILS', 'SECURITY & FINISH']

const INITIAL_FORM_STATE = {
  role: 'customer' as 'customer' | 'owner',
  name: '',
  email: '',
  phone: '',
  cuisine: 'North Indian',
  password: '',
  agreeTerms: false,
}

export function SignupWizard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectAuthLoading)
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { mode } = useThemeMode()

  // If already logged in, redirect directly
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'RESTAURANT_OWNER') {
        router.replace('/owner/dashboard')
      } else {
        router.replace('/menu')
      }
    }
  }, [isAuthenticated, user, router])

  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'info' | 'error' | 'success' }>({
    open: false,
    message: '',
    severity: 'info',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = formData.role === 'customer' ? 'Full name is required' : 'Restaurant name is required'
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required'
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      newErrors.phone = 'Valid 10-digit mobile number required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must accept the terms & conditions'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (activeStep === 1) {
      if (!validateStep1()) {
        setToast({ open: true, message: 'Please correct highlighted errors before proceeding.', severity: 'error' })
        return
      }
    }
    setErrors({})
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setErrors({})
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Guard: Do not validate or submit unless on the final step
    if (activeStep < 2) {
      handleNext()
      return
    }

    if (!validateStep2()) {
      setToast({ open: true, message: 'Please fulfill security conditions.', severity: 'error' })
      return
    }

    const mappedRole = formData.role === 'owner' ? 'RESTAURANT_OWNER' : 'CUSTOMER'

    const resultAction = await dispatch(
      registerThunk({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: mappedRole,
      })
    )

    if (registerThunk.fulfilled.match(resultAction)) {
      const user = resultAction.payload.user
      const message =
        user.role === 'RESTAURANT_OWNER'
          ? 'Restaurant account created! Redirecting to owner dashboard...'
          : 'Customer account created! Redirecting...'

      setToast({ open: true, message, severity: 'success' })

      setTimeout(() => {
        if (user.role === 'RESTAURANT_OWNER') {
          router.push('/owner/dashboard')
        } else {
          router.push('/')
        }
      }, 1500)
    } else if (registerThunk.rejected.match(resultAction)) {
      setToast({
        open: true,
        message: resultAction.payload || 'Registration failed. Please try again.',
        severity: 'error',
      })
    }
  }

  return (
    <SharpPaper sx={{ p: { xs: 1.5, sm: 5 }, borderRadius: { xs: '8px', sm: '16px' }, width: '100%' }}>
      {/* Stepper Navigation */}
      <Box sx={{ mb: { xs: 2, sm: 4 }, width: '100%' }}>
        <Stepper activeStep={activeStep} alternativeLabel connector={<SharpStepConnector />}>
          {STEP_LABELS.map((label, idx) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    borderRadius: 0,
                    fontSize: '1.6rem',
                    '&.Mui-active': { color: '#f97316' },
                    '&.Mui-completed': { color: '#ea580c' },
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: activeStep === idx ? 800 : 600,
                    color: activeStep === idx ? 'primary.main' : 'text.secondary',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider sx={{ mb: 4, borderColor: mode === 'light' ? '#e2e8f0' : '#1e293b' }} />

      {/* Dynamic Step Feature Rendering */}
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {activeStep === 0 && (
          <RoleSelectionStep
            selectedRole={formData.role}
            onSelectRole={(role: 'customer' | 'owner') => setFormData((prev) => ({ ...prev, role }))}
          />
        )}

        {activeStep === 1 && (
          <ProfileDetailsStep formData={formData} errors={errors} onChange={handleInputChange} />
        )}

        {activeStep === 2 && (
          <SecurityCredentialsStep formData={formData} errors={errors} onChange={handleInputChange} />
        )}

        {/* Wizard Controls */}
        <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, mt: { xs: 3, sm: 4 }, width: '100%' }}>
          {activeStep > 0 && (
            <SharpButton
              type="button"
              variant="outlined"
              color="inherit"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{ borderColor: mode === 'light' ? '#cbd5e1' : '#334155', minWidth: { xs: 90, sm: 120 } }}
            >
              BACK
            </SharpButton>
          )}

          {activeStep < 2 ? (
            <SharpButton
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              CONTINUE
            </SharpButton>
          ) : (
            <SharpButton
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading
                ? 'CREATING...'
                : formData.role === 'customer'
                ? 'CREATE'
                : 'REGISTER'}
            </SharpButton>
          )}
        </Box>
      </form>

      {/* Footer Redirect Option */}
      <Box
        sx={{
          mt: 4,
          pt: 3,
          borderTop: '1px solid',
          borderColor: mode === 'light' ? '#f1f5f9' : '#1e293b',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{
              color: '#f97316',
              fontWeight: 800,
              letterSpacing: '0.02em',
              textDecoration: 'none',
            }}
          >
            LOG IN HERE
          </Link>
        </Typography>
      </Box>

      {/* System Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '8px', fontWeight: 700 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </SharpPaper>
  )
}
export default SignupWizard
