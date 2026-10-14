'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginThunk } from '@/store/thunks/login-thunk'
import { logoutThunk } from '@/store/thunks/logout-thunk'
import {
  selectAuthLoading,
  selectCurrentUser,
  selectIsAuthenticated,
} from '@/store/selectors/auth-selectors'

import { useThemeMode } from './auth-theme-context'
import { SharpPaper, SharpButton, SharpTextField } from './auth-ui-primitives'
import { ForgotPasswordDialog } from './forgot-password-dialog'

export function SignInWidget() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectAuthLoading)
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { mode } = useThemeMode()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(
    searchParams?.get('forgot') === 'true'
  )
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'info' | 'error' | 'success' }>({
    open: false,
    message: '',
    severity: 'info',
  })

  if (isAuthenticated && user) {
    return (
      <SharpPaper sx={{ p: { xs: 3, sm: 5 }, width: '100%', textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: '#ea580c',
            mx: 'auto',
            mb: 2,
            fontSize: '1.4rem',
            fontWeight: 800,
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          You are already signed in
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Signed in as <strong>{user.name}</strong> ({user.email})
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <SharpButton
            fullWidth
            variant="contained"
            onClick={() => {
              if (user.role === 'RESTAURANT_OWNER') {
                router.push('/owner/dashboard')
              } else {
                router.push('/home')
              }
            }}
          >
            Continue to {user.role === 'RESTAURANT_OWNER' ? 'Dashboard' : 'Home'}
          </SharpButton>
          <Button
            fullWidth
            variant="outlined"
            onClick={async () => {
              await dispatch(logoutThunk())
            }}
            sx={{
              borderRadius: '8px',
              fontWeight: 700,
              textTransform: 'none',
              py: 1.2,
              borderColor: '#e2e8f0',
              color: 'text.primary',
            }}
          >
            Sign in with a different account
          </Button>
        </Box>
      </SharpPaper>
    )
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Valid email is required'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const resultAction = await dispatch(loginThunk({ email, password }))
    if (loginThunk.fulfilled.match(resultAction)) {
      const user = resultAction.payload.user
      setToast({
        open: true,
        message: 'Signed in successfully! Redirecting...',
        severity: 'success',
      })

      setTimeout(() => {
        if (user.role === 'RESTAURANT_OWNER') {
          router.push('/owner/dashboard')
        } else {
          router.push('/')
        }
      }, 1200)
    } else if (loginThunk.rejected.match(resultAction)) {
      setToast({
        open: true,
        message: resultAction.payload || 'Invalid email or password',
        severity: 'error',
      })
    }
  }

  return (
    <SharpPaper sx={{ p: { xs: 3, sm: 5 }, width: '100%' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography
          variant="h5"
          align="center"
          color="text.primary"
          sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.01em' }}
        >
          WELCOME BACK
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ fontWeight: 500 }}>
          Enter your credentials to access your DineDirect account.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
          <Box sx={{ width: '100%' }}>
            <SharpTextField
              label="EMAIL ADDRESS"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
              }}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ width: '100%' }}>
            <SharpTextField
              type={showPassword ? 'text' : 'password'}
              label="PASSWORD"
              placeholder="Your secret password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
              }}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ borderRadius: '6px' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Forgot Password Link Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
              mt: -1,
            }}
          >
            <Button
              type="button"
              variant="text"
              size="small"
              onClick={() => setForgotPasswordOpen(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                color: '#f97316',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  bgcolor: 'transparent',
                  color: '#ea580c',
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot Password?
            </Button>
          </Box>

          <Box sx={{ mt: 1, width: '100%' }}>
            <SharpButton
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
              endIcon={!loading && <ArrowForwardIcon />}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </SharpButton>
          </Box>
        </Box>
      </Box>

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
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{
              color: '#f97316',
              fontWeight: 800,
              letterSpacing: '0.02em',
              textDecoration: 'none',
            }}
          >
            CREATE ONE HERE
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

      {/* Forgot Password Reset Modal */}
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        defaultEmail={email}
        onPasswordResetSuccess={(newPass, resetEmail) => {
          setEmail(resetEmail)
          setPassword(newPass)
          setToast({
            open: true,
            message: 'Password reset successfully! You can now sign in with your new password.',
            severity: 'success',
          })
        }}
      />
    </SharpPaper>
  )
}
export default SignInWidget
