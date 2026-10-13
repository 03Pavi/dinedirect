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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
  Box,
  Typography,
  Chip,
  RadioGroup,
  Radio,
  FormLabel,
  IconButton,
  Avatar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import { MenuItem as MenuItemType, MenuCategory } from '@/types/menu-types'
import { menuItemSchema } from '@/schemas/menu-schema'
import { useHistoryModal } from '@/hooks/use-history-modal'

// Preset food photography for quick selection
const FOOD_IMAGE_PRESETS = [
  {
    label: 'Paneer / Curry',
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Biryani / Rice',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Burger & Fries',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Pasta',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281788?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Starters / Tandoor',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Beverage / Shake',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Dessert',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
  },
]

interface MenuItemDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    categoryId: string
    name: string
    description: string
    price: number
    imageUrl?: string
    isVeg: boolean
    isAvailable: boolean
    prepTimeMins: number
  }) => Promise<void>
  initialItem?: MenuItemType | null
  categories: MenuCategory[]
  onOpenAddCategory?: () => void
  isSubmitting?: boolean
}

export function MenuItemDialog({
  open,
  onClose,
  onSubmit,
  initialItem,
  categories,
  onOpenAddCategory,
  isSubmitting = false,
}: MenuItemDialogProps) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [prepTimeMins, setPrepTimeMins] = useState('20')
  const [isVeg, setIsVeg] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name || '')
      setCategoryId(initialItem.categoryId || '')
      setDescription(initialItem.description || '')
      setPrice(initialItem.price ? String(initialItem.price) : '')
      setPrepTimeMins(initialItem.prepTimeMins ? String(initialItem.prepTimeMins) : '20')
      setIsVeg(initialItem.isVeg ?? true)
      setIsAvailable(initialItem.isAvailable ?? true)
      setImageUrl(initialItem.imageUrl || '')
    } else {
      setName('')
      setCategoryId(categories.length > 0 ? categories[0].id : '')
      setDescription('')
      setPrice('')
      setPrepTimeMins('20')
      setIsVeg(true)
      setIsAvailable(true)
      setImageUrl('')
    }
    setErrors({})
    setServerError(null)
  }, [initialItem, open, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setServerError(null)

    const payload = {
      name: name.trim(),
      categoryId,
      description: description.trim(),
      price: parseFloat(price) || 0,
      prepTimeMins: parseInt(prepTimeMins, 10) || 20,
      isVeg,
      isAvailable,
      imageUrl: imageUrl.trim() || undefined,
    }

    const validation = menuItemSchema.safeParse(payload)
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    try {
      await onSubmit(payload)
      onClose()
    } catch (err: any) {
      setServerError(err.message || 'Failed to save menu item')
    }
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { handleClose: handleSafeClose } = useHistoryModal({
    open,
    onClose,
    modalId: 'menu-item-dialog',
  })

  const isEditing = Boolean(initialItem)

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleSafeClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '16px',
          p: isMobile ? { xs: 1 } : { xs: 1, sm: 2 },
        },
      }}
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
            {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {isEditing
              ? 'Update dish details, price, or availability'
              : 'Add a new mouthwatering dish to your digital menu'}
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

            {/* Category Selection */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.8 }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                  FOOD CATEGORY *
                </Typography>
                {onOpenAddCategory && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={onOpenAddCategory}
                    sx={{ fontSize: '0.75rem', p: 0, minWidth: 'auto', color: '#ea580c' }}
                  >
                    + New Category
                  </Button>
                )}
              </Stack>
              <FormControl fullWidth error={Boolean(errors.categoryId)}>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  displayEmpty
                  size="small"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="" disabled>
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.categoryId}
                  </Typography>
                )}
              </FormControl>
              {categories.length === 0 && (
                <Typography variant="caption" sx={{ color: '#dc2626', mt: 0.5, display: 'block' }}>
                  No categories found. Please create a category first.
                </Typography>
              )}
            </Box>

            {/* Item Name */}
            <TextField
              label="Dish / Item Name *"
              placeholder="e.g. Butter Chicken, Paneer Tikka, Cold Coffee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
              size="small"
              InputProps={{ sx: { borderRadius: '8px' } }}
            />

            {/* Dietary Type: Veg vs Non-Veg */}
            <Box>
              <FormLabel sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', mb: 1, display: 'block' }}>
                DIETARY PREFERENCE *
              </FormLabel>
              <RadioGroup
                row
                value={isVeg ? 'veg' : 'nonveg'}
                onChange={(e) => setIsVeg(e.target.value === 'veg')}
              >
                <Box
                  onClick={() => setIsVeg(true)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: 1.2,
                    px: 2,
                    mr: 2,
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: isVeg ? '#16a34a' : '#e2e8f0',
                    backgroundColor: isVeg ? '#f0fdf4' : '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Standard Indian Veg Symbol */}
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      border: '2px solid #16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1,
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16a34a' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: isVeg ? '#15803d' : '#475569' }}>
                    Vegetarian
                  </Typography>
                </Box>

                <Box
                  onClick={() => setIsVeg(false)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: 1.2,
                    px: 2,
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: !isVeg ? '#dc2626' : '#e2e8f0',
                    backgroundColor: !isVeg ? '#fef2f2' : '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Standard Indian Non-Veg Symbol */}
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      border: '2px solid #dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 0,
                        height: 0,
                        borderLeft: '4px solid transparent',
                        borderRight: '4px solid transparent',
                        borderBottom: '8px solid #dc2626',
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: !isVeg ? '#b91c1c' : '#475569' }}>
                    Non-Vegetarian
                  </Typography>
                </Box>
              </RadioGroup>
            </Box>

            {/* Price and Prep Time */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Price (₹) *"
                type="number"
                placeholder="249"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={Boolean(errors.price)}
                helperText={errors.price}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  sx: { borderRadius: '8px' },
                }}
              />
              <TextField
                label="Preparation Time *"
                type="number"
                placeholder="20"
                value={prepTimeMins}
                onChange={(e) => setPrepTimeMins(e.target.value)}
                error={Boolean(errors.prepTimeMins)}
                helperText={errors.prepTimeMins}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '8px' },
                }}
              />
            </Stack>

            {/* Description */}
            <TextField
              label="Description *"
              placeholder="Detailed description of flavors, core ingredients, spice level, or serving portion."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description || 'Min 3 characters. Inform diners about what to expect.'}
              fullWidth
              multiline
              rows={3}
              size="small"
              InputProps={{ sx: { borderRadius: '8px' } }}
            />

            {/* Dish Photo URL & Quick Presets */}
            <Box>
              <TextField
                label="Image URL (Optional)"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                error={Boolean(errors.imageUrl)}
                helperText={errors.imageUrl || 'Paste a food photo link or pick from presets below'}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddPhotoAlternateIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '8px' },
                }}
              />

              {/* Quick Preset Badges */}
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.8 }}>
                  QUICK PRESET PHOTOS (CLICK TO APPLY):
                </Typography>
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                  {FOOD_IMAGE_PRESETS.map((preset) => (
                    <Chip
                      key={preset.label}
                      label={preset.label}
                      size="small"
                      onClick={() => setImageUrl(preset.url)}
                      variant={imageUrl === preset.url ? 'filled' : 'outlined'}
                      color={imageUrl === preset.url ? 'primary' : 'default'}
                      sx={{
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        border: imageUrl === preset.url ? 'none' : '1px solid #cbd5e1',
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Live Image Preview */}
              {imageUrl && (
                <Box
                  sx={{
                    mt: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1,
                    borderRadius: '8px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box
                    component="img"
                    src={imageUrl}
                    alt="Preview"
                    onError={() => {}}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '6px',
                      objectFit: 'cover',
                    }}
                  />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block' }}>
                      Image Preview
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', wordBreak: 'break-all' }}>
                      {imageUrl.substring(0, 48)}...
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => setImageUrl('')}
                    sx={{ ml: 'auto', minWidth: 'auto', fontSize: '0.75rem' }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>

            {/* Availability Switch */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '8px',
                bgcolor: isAvailable ? '#f0fdf4' : '#f8fafc',
                border: '1px solid',
                borderColor: isAvailable ? '#bbf7d0' : '#e2e8f0',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      {isAvailable ? 'In Stock (Available to Order)' : 'Out of Stock (Hidden/Disabled)'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {isAvailable
                        ? 'Diners can order this item right now'
                        : 'Mark as currently unavailable in kitchen'}
                    </Typography>
                  </Box>
                }
              />
            </Box>
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
            disabled={isSubmitting || categories.length === 0}
            sx={{
              px: 3,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(232, 93, 4, 0.3)',
            }}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Item to Menu'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
