'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Card,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import CategoryIcon from '@mui/icons-material/Category'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'

import Navbar from '@/components/common/navbar'
import { MenuItemCard } from '@/components/owner/menu-item-card'
import { MenuItemDialog } from '@/components/owner/menu-item-dialog'
import { CategoryDialog } from '@/components/owner/category-dialog'
import { useHistoryModal } from '@/hooks/use-history-modal'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectIsAuthenticated,
  selectIsOwner,
  selectAuthInitialized,
} from '@/store/selectors/auth-selectors'
import { selectMyRestaurant } from '@/store/selectors/restaurant-selectors'
import { fetchMyRestaurantThunk } from '@/store/thunks/fetch-my-restaurant-thunk'
import {
  selectMenuCategories,
  selectMenuItems,
  selectMenuLoading,
} from '@/store/selectors/menu-selectors'
import {
  fetchMenuThunk,
  createCategoryThunk,
  updateCategoryThunk,
  deleteCategoryThunk,
  createMenuItemThunk,
  updateMenuItemThunk,
  toggleItemAvailabilityThunk,
  deleteMenuItemThunk,
} from '@/store/thunks/menu-thunks'
import { MenuItem, MenuCategory } from '@/types/menu-types'

export default function OwnerMenuPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isOwner = useAppSelector(selectIsOwner)
  const authInitialized = useAppSelector(selectAuthInitialized)

  const restaurant = useAppSelector(selectMyRestaurant)
  const categories = useAppSelector(selectMenuCategories)
  const items = useAppSelector(selectMenuItems)
  const menuLoading = useAppSelector(selectMenuLoading)

  // Filters & State
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL')
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL')

  // Dialog States
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)

  // Deletion Confirmation
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MenuItem | null>(null)
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<MenuCategory | null>(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { handleClose: handleCloseDeleteItem } = useHistoryModal({
    open: Boolean(deleteConfirmItem),
    onClose: () => setDeleteConfirmItem(null),
    modalId: 'delete-item-dialog',
  })

  const { handleClose: handleCloseDeleteCategory } = useHistoryModal({
    open: Boolean(deleteConfirmCategory),
    onClose: () => setDeleteConfirmCategory(null),
    modalId: 'delete-category-dialog',
  })

  // Action status
  const [isSubmittingItem, setIsSubmittingItem] = useState(false)
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false)
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Auth & Initial Data Fetch
  useEffect(() => {
    if (authInitialized) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (!isOwner) {
        router.push('/')
      } else {
        dispatch(fetchMyRestaurantThunk())
          .then((action) => {
            if (fetchMyRestaurantThunk.fulfilled.match(action) && action.payload) {
              return dispatch(fetchMenuThunk({ restaurantId: action.payload.id }))
            }
          })
          .finally(() => {
            setInitialLoading(false)
          })
      }
    }
  }, [authInitialized, isAuthenticated, isOwner, router, dispatch])

  // Filtered Items Calculation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategoryTab !== 'ALL' && item.categoryId !== selectedCategoryTab) {
        return false
      }
      // Dietary filter
      if (dietaryFilter === 'VEG' && !item.isVeg) return false
      if (dietaryFilter === 'NON_VEG' && item.isVeg) return false
      // Availability filter
      if (availabilityFilter === 'IN_STOCK' && !item.isAvailable) return false
      if (availabilityFilter === 'OUT_OF_STOCK' && item.isAvailable) return false
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = item.name.toLowerCase().includes(query)
        const matchesDesc = item.description?.toLowerCase().includes(query)
        if (!matchesName && !matchesDesc) return false
      }
      return true
    })
  }, [items, selectedCategoryTab, dietaryFilter, availabilityFilter, searchQuery])

  // Stats
  const inStockCount = useMemo(() => items.filter((i) => i.isAvailable).length, [items])
  const vegCount = useMemo(() => items.filter((i) => i.isVeg).length, [items])
  const nonVegCount = useMemo(() => items.filter((i) => !i.isVeg).length, [items])

  // Handlers for Items
  const handleOpenAddItem = () => {
    setEditingItem(null)
    setItemDialogOpen(true)
  }

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setItemDialogOpen(true)
  }

  const handleSaveItem = async (data: {
    categoryId: string
    name: string
    description: string
    price: number
    imageUrl?: string
    isVeg: boolean
    isAvailable: boolean
    prepTimeMins: number
  }) => {
    setIsSubmittingItem(true)
    try {
      if (editingItem) {
        const res = await dispatch(updateMenuItemThunk({ id: editingItem.id, ...data }))
        if (updateMenuItemThunk.rejected.match(res)) {
          throw new Error(res.payload || 'Failed to update item')
        }
        setSnackbar({ open: true, message: `"${data.name}" updated successfully!`, severity: 'success' })
      } else {
        const res = await dispatch(createMenuItemThunk(data))
        if (createMenuItemThunk.rejected.match(res)) {
          throw new Error(res.payload || 'Failed to add item')
        }
        setSnackbar({ open: true, message: `"${data.name}" added to menu!`, severity: 'success' })
      }
    } finally {
      setIsSubmittingItem(false)
    }
  }

  const handleToggleAvailability = async (item: MenuItem) => {
    setTogglingItemId(item.id)
    try {
      const newStatus = !item.isAvailable
      await dispatch(toggleItemAvailabilityThunk({ id: item.id, isAvailable: newStatus }))
      setSnackbar({
        open: true,
        message: `${item.name} is now ${newStatus ? 'IN STOCK' : 'OUT OF STOCK'}`,
        severity: 'success',
      })
    } finally {
      setTogglingItemId(null)
    }
  }

  const handleDeleteItem = async () => {
    if (!deleteConfirmItem) return
    const id = deleteConfirmItem.id
    const name = deleteConfirmItem.name
    setDeleteConfirmItem(null)
    const res = await dispatch(deleteMenuItemThunk(id))
    if (deleteMenuItemThunk.fulfilled.match(res)) {
      setSnackbar({ open: true, message: `"${name}" removed from menu`, severity: 'success' })
    } else {
      setSnackbar({ open: true, message: res.payload || 'Failed to delete item', severity: 'error' })
    }
  }

  // Handlers for Categories
  const handleOpenAddCategory = () => {
    setEditingCategory(null)
    setCategoryDialogOpen(true)
  }

  const handleOpenEditCategory = (cat: MenuCategory) => {
    setEditingCategory(cat)
    setCategoryDialogOpen(true)
  }

  const handleSaveCategory = async (data: { name: string; sortOrder?: number }) => {
    if (!restaurant) return
    setIsSubmittingCategory(true)
    try {
      if (editingCategory) {
        const res = await dispatch(updateCategoryThunk({ id: editingCategory.id, ...data }))
        if (updateCategoryThunk.rejected.match(res)) {
          throw new Error(res.payload || 'Failed to update category')
        }
        setSnackbar({ open: true, message: `Category "${data.name}" updated!`, severity: 'success' })
      } else {
        const res = await dispatch(
          createCategoryThunk({
            restaurantId: restaurant.id,
            name: data.name,
            sortOrder: data.sortOrder,
          })
        )
        if (createCategoryThunk.rejected.match(res)) {
          throw new Error(res.payload || 'Failed to create category')
        }
        setSnackbar({ open: true, message: `Category "${data.name}" created!`, severity: 'success' })
      }
    } finally {
      setIsSubmittingCategory(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteConfirmCategory) return
    const id = deleteConfirmCategory.id
    const name = deleteConfirmCategory.name
    setDeleteConfirmCategory(null)
    const res = await dispatch(deleteCategoryThunk(id))
    if (deleteCategoryThunk.fulfilled.match(res)) {
      if (selectedCategoryTab === id) {
        setSelectedCategoryTab('ALL')
      }
      setSnackbar({ open: true, message: `Category "${name}" and items deleted`, severity: 'success' })
    } else {
      setSnackbar({ open: true, message: res.payload || 'Failed to delete category', severity: 'error' })
    }
  }

  // Quick Seed Default Categories helper
  const handleQuickSeedCategories = async () => {
    if (!restaurant) return
    const defaults = ['Starters & Appetizers', 'Main Course', 'Breads & Rice', 'Beverages & Mocktails', 'Desserts']
    for (let i = 0; i < defaults.length; i++) {
      await dispatch(
        createCategoryThunk({
          restaurantId: restaurant.id,
          name: defaults[i],
          sortOrder: i * 10,
        })
      )
    }
    setSnackbar({ open: true, message: 'Created recommended food categories!', severity: 'success' })
  }

  if (!authInitialized || initialLoading || (menuLoading && items.length === 0)) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 }, flexGrow: 1 }}>
          <Stack spacing={3}>
            {/* Header Skeleton with Navigation and Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 2,
              }}
            >
              <Box sx={{ width: '100%', maxWidth: 450 }}>
                <Skeleton variant="text" width={120} height={20} sx={{ mb: 1, borderRadius: '4px' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Skeleton variant="text" width={220} height={42} sx={{ borderRadius: '6px' }} />
                  <Skeleton variant="rounded" width={95} height={24} sx={{ borderRadius: '6px' }} />
                </Box>
                <Skeleton variant="text" width="85%" height={18} sx={{ borderRadius: '4px' }} />
              </Box>

              {/* Action Buttons Skeleton */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Skeleton variant="rounded" width={175} height={40} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rounded" width={135} height={40} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rounded" width={150} height={40} sx={{ borderRadius: '8px' }} />
              </Stack>
            </Box>

            {/* 4 Stat Summary Cards Skeleton */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: '14px',
                    border: '1.5px solid #f1f5f9',
                    bgcolor: '#ffffff',
                  }}
                >
                  <Skeleton variant="text" width="55%" height={16} sx={{ mb: 1, borderRadius: '4px' }} />
                  <Skeleton variant="text" width="35%" height={38} sx={{ borderRadius: '6px' }} />
                </Card>
              ))}
            </Box>

            {/* Search, Filter Bar & Tabs Skeleton */}
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1.5px solid #f1f5f9',
                bgcolor: '#ffffff',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', lg: 'row' },
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 2.5,
                }}
              >
                <Skeleton variant="rounded" height={42} sx={{ borderRadius: '10px', width: { xs: '100%', md: 360 } }} />
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Skeleton variant="rounded" width={160} height={38} sx={{ borderRadius: '8px' }} />
                  <Skeleton variant="rounded" width={160} height={38} sx={{ borderRadius: '8px' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Skeleton variant="rounded" width={110} height={34} sx={{ borderRadius: '20px' }} />
                <Skeleton variant="rounded" width={120} height={34} sx={{ borderRadius: '20px' }} />
                <Skeleton variant="rounded" width={100} height={34} sx={{ borderRadius: '20px' }} />
              </Box>
            </Card>

            {/* Dishes Grid Skeleton */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 2.5,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <Card
                  key={idx}
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    border: '1.5px solid #f1f5f9',
                    bgcolor: '#ffffff',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: 380,
                  }}
                >
                  <Skeleton variant="rectangular" height={190} animation="wave" sx={{ bgcolor: '#f1f5f9' }} />
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Skeleton variant="text" width="60%" height={26} sx={{ borderRadius: '4px' }} />
                        <Skeleton variant="rounded" width={50} height={22} sx={{ borderRadius: '12px' }} />
                      </Box>
                      <Skeleton variant="text" width="90%" height={16} sx={{ mb: 0.5, borderRadius: '4px' }} />
                      <Skeleton variant="text" width="70%" height={16} sx={{ borderRadius: '4px' }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid #f8fafc' }}>
                      <Skeleton variant="text" width={60} height={28} sx={{ borderRadius: '4px' }} />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          </Stack>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 }, flexGrow: 1 }}>
        {/* If no restaurant configured yet */}
        {!restaurant ? (
          <Card
            elevation={0}
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <RestaurantMenuIcon sx={{ fontSize: 60, color: '#f97316', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Set Up Your Restaurant First
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3, maxWidth: 500, mx: 'auto' }}>
              Before adding dishes to your menu, you need to register your restaurant profile on the dashboard.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/owner/dashboard"
              sx={{ px: 4, py: 1.2, fontWeight: 700 }}
            >
              Go to Dashboard Setup
            </Button>
          </Card>
        ) : (
          <Stack spacing={3}>
            {/* Header with Navigation and Quick Actions */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 2,
              }}
            >
              <Box>
                <Button
                  component={Link}
                  variant='text'
                  href="/owner/dashboard"
                  startIcon={<ArrowBackIcon />}
                  sx={{ color: '#64748b', fontSize: '0.85rem', p: 0, mb: 1, minWidth: 'auto' }}
                >
                  Back to Dashboard
                </Button>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Menu & Dishes
                  </Typography>
                  <Chip
                    label={restaurant.name}
                    size="small"
                    sx={{
                      bgcolor: '#fff7ed',
                      color: '#ea580c',
                      fontWeight: 700,
                      borderRadius: '6px',
                    }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                  Manage item pricing, photos, dietary tags, stock status, and dish categories.
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Button
                  variant="outlined"
                  color="secondary"
                  component={Link}
                  href={`/home?restaurantId=${restaurant.id}`}
                  target="_blank"
                  startIcon={<VisibilityIcon />}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderColor: '#cbd5e1',
                  }}
                >
                  Preview Customer Menu
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleOpenAddCategory}
                  startIcon={<CategoryIcon />}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderColor: '#cbd5e1',
                    color: '#334155',
                  }}
                >
                  + Add Category
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenAddItem}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(232, 93, 4, 0.3)',
                    px: 2.5,
                  }}
                >
                  + Add Menu Item
                </Button>
              </Stack>
            </Box>

            {/* Metrics Overview Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                  TOTAL DISHES
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                  {items.length}
                </Typography>
              </Card>

              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                  CATEGORIES
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                  {categories.length}
                </Typography>
              </Card>

              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                }}
              >
                <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700 }}>
                  IN STOCK (LIVE)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                  {inStockCount}
                </Typography>
              </Card>

              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                  VEG / NON-VEG
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                  <span style={{ color: '#16a34a' }}>{vegCount}</span> /{' '}
                  <span style={{ color: '#dc2626' }}>{nonVegCount}</span>
                </Typography>
              </Card>
            </Box>

            {/* Filter & Search Toolbar */}
            <Card
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                {/* Search Field */}
                <Box>
                  <TextField
                    placeholder="Search dishes by name or ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '8px' },
                    }}
                  />
                </Box>

                {/* Dietary Filter */}
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                      DIET:
                    </Typography>
                    {(['ALL', 'VEG', 'NON_VEG'] as const).map((filter) => (
                      <Chip
                        key={filter}
                        label={
                          filter === 'ALL'
                            ? 'All'
                            : filter === 'VEG'
                            ? '🌱 Pure Veg'
                            : '🍗 Non-Veg'
                        }
                        size="small"
                        onClick={() => setDietaryFilter(filter)}
                        color={dietaryFilter === filter ? 'primary' : 'default'}
                        variant={dietaryFilter === filter ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 700,
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Availability Filter */}
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ sm: 'flex-end' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                      STOCK:
                    </Typography>
                    {(['ALL', 'IN_STOCK', 'OUT_OF_STOCK'] as const).map((filter) => (
                      <Chip
                        key={filter}
                        label={
                          filter === 'ALL'
                            ? 'All'
                            : filter === 'IN_STOCK'
                            ? 'In Stock'
                            : 'Out of Stock'
                        }
                        size="small"
                        onClick={() => setAvailabilityFilter(filter)}
                        color={
                          availabilityFilter === filter
                            ? filter === 'IN_STOCK'
                              ? 'success'
                              : 'default'
                            : 'default'
                        }
                        variant={availabilityFilter === filter ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 700,
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Box>

              {/* Category Navigation Tabs */}
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                  <Tabs
                    value={selectedCategoryTab}
                    onChange={(_, val) => setSelectedCategoryTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      minHeight: 38,
                      '& .MuiTab-root': {
                        minHeight: 38,
                        py: 0.5,
                        px: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        borderRadius: '6px',
                        mr: 1,
                      },
                      '& .Mui-selected': {
                        color: '#ea580c !important',
                        bgcolor: '#fff7ed',
                      },
                      '& .MuiTabs-indicator': {
                        display: 'none',
                      },
                    }}
                  >
                    <Tab
                      value="ALL"
                      label={`All Items (${items.length})`}
                    />
                    {categories.map((cat) => {
                      const count = items.filter((i) => i.categoryId === cat.id).length
                      return (
                        <Tab
                          key={cat.id}
                          value={cat.id}
                          label={`${cat.name} (${count})`}
                        />
                      )
                    })}
                  </Tabs>
                </Box>

                {/* Edit Category actions if specific category tab selected */}
                {selectedCategoryTab !== 'ALL' && (
                  <Stack direction="row" spacing={0.5} sx={{ pl: 1 }}>
                    {(() => {
                      const activeCat = categories.find((c) => c.id === selectedCategoryTab)
                      if (!activeCat) return null
                      return (
                        <>
                          <Tooltip title="Rename Category">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditCategory(activeCat)}
                              sx={{ color: '#64748b' }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Category">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteConfirmCategory(activeCat)}
                              sx={{ color: '#dc2626' }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )
                    })()}
                  </Stack>
                )}
              </Box>
            </Card>

            {/* Menu Items Grid */}
            {filteredItems.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                {filteredItems.map((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId)
                  return (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      categoryName={cat?.name}
                      onEdit={handleOpenEditItem}
                      onDelete={(it) => setDeleteConfirmItem(it)}
                      onToggleAvailability={handleToggleAvailability}
                      isToggling={togglingItemId === item.id}
                    />
                  )
                })}
              </Box>
            ) : (
              /* Empty State */
              <Card
                elevation={0}
                sx={{
                  p: { xs: 4, sm: 6 },
                  textAlign: 'center',
                  borderRadius: '16px',
                  border: '2px dashed #cbd5e1',
                  bgcolor: '#ffffff',
                }}
              >
                <RestaurantMenuIcon sx={{ fontSize: 52, color: '#f97316', mb: 2, opacity: 0.7 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                  {items.length === 0 ? 'Your Menu is Empty' : 'No Items Found'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3, maxWidth: 450, mx: 'auto' }}>
                  {items.length === 0
                    ? categories.length === 0
                      ? 'Start by creating food categories or use our recommended categories, then add dishes to your digital menu.'
                      : 'Categories are ready! Click the button below to add your first dish.'
                    : 'No items match your active search or filters. Try clearing filters or searching for something else.'}
                </Typography>

                <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
                  {categories.length === 0 ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleQuickSeedCategories}
                        sx={{ fontWeight: 700 }}
                      >
                        Auto-Create Standard Categories
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleOpenAddCategory}
                        sx={{ fontWeight: 700 }}
                      >
                        + Create Custom Category
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleOpenAddItem}
                      startIcon={<AddIcon />}
                      sx={{ fontWeight: 700, px: 3 }}
                    >
                      + Add Menu Item Now
                    </Button>
                  )}
                </Stack>
              </Card>
            )}
          </Stack>
        )}
      </Container>

      {/* Add / Edit Item Dialog */}
      <MenuItemDialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        onSubmit={handleSaveItem}
        initialItem={editingItem}
        categories={categories}
        onOpenAddCategory={handleOpenAddCategory}
        isSubmitting={isSubmittingItem}
      />

      {/* Add / Edit Category Dialog */}
      <CategoryDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        onSubmit={handleSaveCategory}
        initialCategory={editingCategory}
        isSubmitting={isSubmittingCategory}
      />

      {/* Delete Item Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirmItem)}
        onClose={handleCloseDeleteItem}
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>
          Delete Menu Item?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove <strong>"{deleteConfirmItem?.name}"</strong> from your menu? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDeleteItem} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteItem} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Delete Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirmCategory)}
        onClose={handleCloseDeleteCategory}
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '12px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>
          Delete Category?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deleting <strong>"{deleteConfirmCategory?.name}"</strong> will also permanently delete all dishes associated with it. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDeleteCategory} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteCategory} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Delete Category & Items
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 700, borderRadius: '8px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
