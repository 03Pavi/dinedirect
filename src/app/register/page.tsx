'use client'

import React from 'react'
import { Container, Box, IconButton } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { AuthThemeProvider, useThemeMode, SignupWizard } from '@/components/auth'

function RegisterContent() {
  const { mode, toggleTheme } = useThemeMode()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 0, sm: 4 },
        py: { xs: 1, sm: 4 },
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      {/* Floating Theme Toggle in top-right corner */}
      <IconButton
        onClick={toggleTheme}
        aria-label="Toggle theme mode"
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          bgcolor: mode === 'light' ? '#e2e8f0' : '#1e293b',
          color: 'text.primary',
          borderRadius: '8px',
          p: 1.2,
          '&:hover': {
            bgcolor: mode === 'light' ? '#cbd5e1' : '#334155',
          },
        }}
      >
        {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
      </IconButton>

      <Container
        maxWidth={false}
        sx={{
          maxWidth: { xs: '100%', sm: 660, md: 740 },
          px: { xs: 0, sm: 2 },
          width: '100%',
        }}
      >
        <SignupWizard />
      </Container>
    </Box>
  )
}

export default function RegisterPage() {
  return (
    <AuthThemeProvider>
      <RegisterContent />
    </AuthThemeProvider>
  )
}
