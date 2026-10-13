'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EmailIcon from '@mui/icons-material/Email'
import LockResetIcon from '@mui/icons-material/LockReset'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

import { apiClient } from '@/utils/api-client'
import { useHistoryModal } from '@/hooks/use-history-modal'
import { useThemeMode } from './auth-theme-context'
import { SharpButton, SharpTextField } from './auth-ui-primitives'

interface ForgotPasswordDialogProps {
  open: boolean
  onClose: () => void
  defaultEmail?: string
  onPasswordResetSuccess?: (newPassword: string, email: string) => void
}

export function ForgotPasswordDialog({
  open,
  onClose,
  defaultEmail = '',
  onPasswordResetSuccess,
}: ForgotPasswordDialogProps) {
  const { mode } = useThemeMode()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { handleClose: handleSafeClose } = useHistoryModal({
    open,
    onClose,
    modalId: 'forgot-password-dialog',
  })

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Sync defaultEmail when modal opens
  useEffect(() => {
    if (open) {
      setEmail(defaultEmail || '')
      setNewPassword('')
      setConfirmPassword('')
      setErrorMsg(null)
      setSuccess(false)
    }
  }, [open, defaultEmail])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both fields.')
      return
    }

    try {
      setLoading(true)
      const res = await apiClient.post<{ success: boolean; message: string }>(
        '/api/auth/reset-password',
        {
          email: email.trim(),
          newPassword,
        }
      )

      if (res && res.success) {
        setSuccess(true)
        if (onPasswordResetSuccess) {
          onPasswordResetSuccess(newPassword, email.trim())
        }
      } else {
        setErrorMsg('Failed to reset password. Please try again.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to reset password. Please check your email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleSafeClose}
      fullScreen={isMobile}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '16px',
          border: isMobile ? 'none' : '1.5px solid',
          borderColor: mode === 'light' ? '#cbd5e1' : '#334155',
          bgcolor: 'background.paper',
          p: isMobile ? { xs: 3, sm: 3.5 } : { xs: 2, sm: 3 },
          boxShadow: isMobile
            ? 'none'
            : mode === 'light'
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          minHeight: isMobile ? '100vh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobile ? 'center' : 'flex-start',
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          mb: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: '10px',
              bgcolor: mode === 'light' ? '#ffedd5' : 'rgba(249, 115, 22, 0.15)',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockResetIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                color: 'text.primary',
              }}
            >
              FORGOT PASSWORD
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Reset credentials & access your account
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={handleSafeClose}
          size="small"
          disabled={loading}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary', bgcolor: mode === 'light' ? '#f1f5f9' : '#1e293b' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        {success ? (
          <Box
            sx={{
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: mode === 'light' ? '#dcfce7' : 'rgba(34, 197, 94, 0.2)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Password Reset Complete!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your password has been successfully updated. You can now use your new password to sign into DineDirect.
            </Typography>
            <SharpButton
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSafeClose}
              sx={{ mt: 1 }}
            >
              SIGN IN NOW
            </SharpButton>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleReset} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
              Enter your registered account email and set a new password below.
            </Typography>

            {errorMsg && (
              <Alert severity="error" sx={{ borderRadius: '8px', fontWeight: 600, py: 0.5 }}>
                {errorMsg}
              </Alert>
            )}

            <SharpTextField
              label="REGISTERED EMAIL"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <SharpTextField
              label="NEW PASSWORD"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ borderRadius: '6px' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <SharpTextField
              label="CONFIRM NEW PASSWORD"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                      sx={{ borderRadius: '6px' }}
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <DialogActions sx={{ p: 0, mt: 1.5, gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleSafeClose}
                disabled={loading}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 700,
                  py: 1.2,
                  px: 2.5,
                  borderColor: mode === 'light' ? '#cbd5e1' : '#475569',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'text.primary',
                    bgcolor: mode === 'light' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              >
                CANCEL
              </Button>

              <SharpButton
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ flex: 1, py: 1.2 }}
                startIcon={loading && <CircularProgress size={18} color="inherit" />}
              >
                {loading ? 'RESETTING...' : 'RESET PASSWORD'}
              </SharpButton>
            </DialogActions>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ForgotPasswordDialog
