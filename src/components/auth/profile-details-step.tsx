'use client'

import React from 'react'
import { Box, Typography, InputAdornment, MenuItem } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import StorefrontIcon from '@mui/icons-material/Storefront'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import FastfoodIcon from '@mui/icons-material/Fastfood'
import { SharpTextField } from './auth-ui-primitives'

export const CUISINE_OPTIONS = [
  { value: 'Italian', label: 'Italian & Pizzeria' },
  { value: 'Fast Food', label: 'Burgers & Fast Food' },
  { value: 'North Indian', label: 'North Indian & Mughlai' },
  { value: 'South Indian', label: 'South Indian & Dosa' },
  { value: 'Asian', label: 'Asian & Chinese' },
  { value: 'Bakery', label: 'Bakery & Cafe' },
  { value: 'Healthy Bowls', label: 'Healthy Bowls & Salads' },
]

export interface ProfileFormData {
  role: string
  name: string
  email: string
  phone: string
  cuisine: string
}

export interface ProfileDetailsStepProps {
  formData: ProfileFormData
  errors: Record<string, string | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProfileDetailsStep({ formData, errors, onChange }: ProfileDetailsStepProps) {
  const isCustomer = formData.role === 'customer'

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" color="text.primary" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.01em' }}>
        {isCustomer ? 'PERSONAL DETAILS' : 'RESTAURANT DETAILS'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, fontWeight: 500 }}>
        Please enter verified contact credentials for your account.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
        <Box sx={{ width: '100%' }}>
          <SharpTextField
            label={isCustomer ? 'FULL NAME' : 'RESTAURANT NAME'}
            placeholder={isCustomer ? 'John Doe' : 'The Gourmet Bistro'}
            name="name"
            value={formData.name}
            onChange={onChange}
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isCustomer ? <PersonIcon color="action" /> : <StorefrontIcon color="action" />}
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ width: '100%' }}>
          <SharpTextField
            label="EMAIL ADDRESS"
            placeholder="name@company.com"
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
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

        {!isCustomer && (
          <Box sx={{ width: '100%' }}>
            <SharpTextField
              select
              label="PRIMARY CUISINE SPECIALTY"
              name="cuisine"
              value={formData.cuisine}
              onChange={onChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FastfoodIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {CUISINE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ borderRadius: '6px', fontWeight: 600 }}>
                  {opt.label}
                </MenuItem>
              ))}
            </SharpTextField>
          </Box>
        )}

        <Box sx={{ width: '100%' }}>
          <SharpTextField
            label="PHONE NUMBER"
            placeholder="10-digit mobile number"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            error={!!errors.phone}
            helperText={errors.phone || 'Required for real-time notifications'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
export default ProfileDetailsStep
