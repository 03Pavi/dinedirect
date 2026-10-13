'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { SharpTextField } from './auth-ui-primitives'
import { useThemeMode } from './auth-theme-context'

export interface SecurityFormData {
  password: string
  agreeTerms: boolean
}

export interface SecurityCredentialsStepProps {
  formData: SecurityFormData
  errors: Record<string, string | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function SecurityCredentialsStep({ formData, errors, onChange }: SecurityCredentialsStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { mode } = useThemeMode()

  const isPassLength = formData.password.length >= 8
  const isPassNumber = /[0-9!@#$%^&*]/.test(formData.password)

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" color="text.primary" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.01em' }}>
        SECURITY & PASSWORD
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, fontWeight: 500 }}>
        Create a robust password to ensure full protection of your account.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
        <Box sx={{ width: '100%' }}>
          <SharpTextField
            type={showPassword ? 'text' : 'password'}
            label="CREATE PASSWORD"
            placeholder="At least 8 characters"
            name="password"
            value={formData.password}
            onChange={onChange}
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

        {/* Live Security Strength Box */}
        <Box
          sx={{
            width: '100%',
            p: 2,
            borderRadius: '10px',
            border: '1.5px solid',
            borderColor: mode === 'light' ? '#e2e8f0' : '#1e293b',
            bgcolor: mode === 'light' ? '#f8fafc' : '#0f172a',
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: isPassLength ? 'success.main' : 'text.disabled' }} />
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: isPassLength ? 'success.main' : 'text.secondary' }}
            >
              At least 8 characters long
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: isPassNumber ? 'success.main' : 'text.disabled' }} />
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: isPassNumber ? 'success.main' : 'text.secondary' }}
            >
              Contains a number or special character
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%' }}>
          <FormControlLabel
            control={
              <Checkbox
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={onChange}
                color="primary"
                sx={{ borderRadius: '4px' }}
              />
            }
            label={
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                I agree to the DineDirect <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.
              </Typography>
            }
          />
          {errors.agreeTerms && (
            <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5, fontWeight: 700 }}>
              {errors.agreeTerms}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}
export default SecurityCredentialsStep
