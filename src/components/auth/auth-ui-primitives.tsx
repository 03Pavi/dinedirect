'use client'

import React from 'react'
import Link from 'next/link'
import {
  Button,
  ButtonProps,
  Paper,
  PaperProps,
  TextField,
  TextFieldProps,
  Box,
  Typography,
  IconButton,
  StepConnector,
  stepConnectorClasses,
  styled,
} from '@mui/material'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useThemeMode } from './auth-theme-context'

export const SharpStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#f97316',
      borderTopWidth: 3,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#ea580c',
      borderTopWidth: 3,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0',
    borderTopWidth: 3,
    borderRadius: 4,
  },
}))

export const SharpButton = (props: ButtonProps) => (
  <Button
    disableElevation
    disableRipple={false}
    {...props}
    sx={{
      borderRadius: '8px',
      textTransform: 'uppercase',
      fontWeight: 800,
      letterSpacing: '0.06em',
      px: 3.5,
      py: 1.6,
      ...props.sx,
    }}
  />
)

export const SharpPaper = ({ children, sx, ...props }: PaperProps) => (
  <Paper
    elevation={0}
    {...props}
    sx={{
      borderRadius: '16px',
      border: '1.5px solid',
      borderColor: (theme) => (theme.palette.mode === 'light' ? '#cbd5e1' : '#334155'),
      bgcolor: 'background.paper',
      width: '100%',
      ...sx,
    }}
  >
    {children}
  </Paper>
)

export const SharpTextField = (props: TextFieldProps) => {
  const { mode } = useThemeMode()
  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
      InputLabelProps={{
        shrink: true,
        sx: {
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: mode === 'light' ? '#475569' : '#94a3b8',
          '&.Mui-focused': {
            color: '#f97316',
          },
        },
        ...props.InputLabelProps,
      }}
      sx={{
        width: '100%',
        '& .MuiOutlinedInput-root': {
          width: '100%',
          borderRadius: '10px',
          bgcolor: mode === 'light' ? '#f8fafc' : '#0f172a',
          '& fieldset': {
            borderColor: mode === 'light' ? '#cbd5e1' : '#334155',
            borderWidth: '1.5px',
          },
          '&:hover fieldset': {
            borderColor: '#f97316 !important',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#f97316 !important',
            borderWidth: '2px',
          },
        },
        '& .MuiOutlinedInput-input': {
          padding: '14px 14px',
          fontWeight: 600,
          fontSize: '0.95rem',
        },
        ...props.sx,
      }}
    />
  )
}

export function AuthHeader() {
  const { mode, toggleTheme } = useThemeMode()

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2.5,
        px: { xs: 1, sm: 0 },
        width: '100%',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: '#ffffff',
              p: 1,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RestaurantIcon />
          </Box>
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 800, letterSpacing: '0.06em' }}>
            DINEDIRECT
          </Typography>
        </Box>
      </Link>

      <IconButton
        onClick={toggleTheme}
        sx={{
          bgcolor: mode === 'light' ? '#e2e8f0' : '#1e293b',
          color: 'text.primary',
          borderRadius: '8px',
          p: 1.2,
        }}
      >
        {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
      </IconButton>
    </Box>
  )
}
