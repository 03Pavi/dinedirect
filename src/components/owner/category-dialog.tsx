'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  Typography,
  Alert,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { MenuCategory } from '@/types/menu-types'
import { useHistoryModal } from '@/hooks/use-history-modal'

interface CategoryDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; sortOrder?: number }) => Promise<void>
  initialCategory?: MenuCategory | null
  isSubmitting?: boolean
}

export function CategoryDialog({
  open,
  onClose,
  onSubmit,
  initialCategory,
  isSubmitting = false,
}: CategoryDialogProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { handleClose: handleSafeClose } = useHistoryModal({
    open,
    onClose,
    modalId: 'category-dialog',
  })

  const [name, setName] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [error, setError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name)
      setSortOrder(String(initialCategory.sortOrder ?? 0))
    } else {
      setName('')
      setSortOrder('0')
    }
    setError(null)
    setServerError(null)
  }, [initialCategory, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Category name is required')
      return
    }
    if (name.trim().length < 2) {
      setError('Category name must be at least 2 characters')
      return
    }

    try {
      await onSubmit({
        name: name.trim(),
        sortOrder: parseInt(sortOrder, 10) || 0,
      })
      onClose()
    } catch (err: any) {
      setServerError(err.message || 'Failed to save category')
    }
  }

  const isEditing = Boolean(initialCategory)

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleSafeClose}
      fullScreen={isMobile}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : '16px', p: isMobile ? 2 : 1 } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {isEditing ? 'Rename or reorder category' : 'Organize dishes by culinary group'}
          </Typography>
        </Box>
        <IconButton onClick={handleSafeClose} disabled={isSubmitting} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ pt: 2, pb: 3 }}>
          <Stack spacing={2.5}>
            {serverError && (
              <Alert severity="error" onClose={() => setServerError(null)}>
                {serverError}
              </Alert>
            )}

            <TextField
              label="Category Name *"
              placeholder="e.g. Starters, Main Course, Breads, Mocktails"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              error={Boolean(error)}
              helperText={error}
              fullWidth
              size="small"
              autoFocus
              InputProps={{ sx: { borderRadius: '8px' } }}
            />

            <TextField
              label="Display Order (Optional)"
              type="number"
              placeholder="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              helperText="Lower numbers appear first on the menu"
              fullWidth
              size="small"
              InputProps={{ sx: { borderRadius: '8px' } }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1.5 }}>
          <Button onClick={handleSafeClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ px: 3, fontWeight: 700 }}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
