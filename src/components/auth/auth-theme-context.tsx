'use client'

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

interface ThemeModeContextType {
  mode: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: 'light',
  toggleTheme: () => {},
})

export const useThemeMode = () => useContext(ThemeModeContext)

export function AuthThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#f97316',
            light: '#ffedd5',
            dark: '#ea580c',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#0f172a',
          },
          background: {
            default: mode === 'light' ? '#f1f5f9' : '#090d16',
            paper: mode === 'light' ? '#ffffff' : '#111827',
          },
          text: {
            primary: mode === 'light' ? '#0f172a' : '#f8fafc',
            secondary: mode === 'light' ? '#64748b' : '#94a3b8',
          },
        },
        typography: {
          fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: { borderRadius: '16px' },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: '8px' },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: { borderRadius: '10px' },
            },
          },
        },
      }),
    [mode]
  )

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
export default AuthThemeProvider
