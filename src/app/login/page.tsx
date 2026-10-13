'use client'

import React, { Suspense } from 'react'
import { Container, Box } from '@mui/material'
import { AuthThemeProvider, AuthHeader, SignInWidget } from '@/components/auth'

export default function LoginPage() {
  return (
    <AuthThemeProvider>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, sm: 4 },
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="xs" sx={{ px: { xs: 0, sm: 2 }, width: '100%' }}>
          <AuthHeader />
          <Suspense fallback={null}>
            <SignInWidget />
          </Suspense>
        </Container>
      </Box>
    </AuthThemeProvider>
  )
}
