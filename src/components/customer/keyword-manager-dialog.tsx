'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { apiClient } from '@/utils/api-client'

export interface KeywordItem {
  id: string
  keyword: string
  category?: string
  sortOrder?: number
  isTrending?: boolean
}

interface KeywordManagerDialogProps {
  open: boolean
  onClose: () => void
  keywords: KeywordItem[]
  onKeywordsChange: (updatedKeywords: KeywordItem[]) => void
}

export function KeywordManagerDialog({
  open,
  onClose,
  keywords,
  onKeywordsChange,
}: KeywordManagerDialogProps) {
  const [newKeyword, setNewKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleAddKeyword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = newKeyword.trim()
    if (!trimmed) return

    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await apiClient.post<{ keyword?: KeywordItem; message?: string }>('/api/keywords', {
        keyword: trimmed,
        category: 'trending',
      })

      if (res?.keyword) {
        const added = res.keyword
        // Avoid duplicates in local state
        const exists = keywords.some(
          (k) => k.keyword.toLowerCase() === added.keyword.toLowerCase()
        )
        if (!exists) {
          onKeywordsChange([...keywords, added])
        }
        setSuccessMsg(`"${added.keyword}" added to trending collection!`)
        setNewKeyword('')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add keyword')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKeyword = async (item: KeywordItem) => {
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await apiClient.delete(`/api/keywords?id=${item.id}&keyword=${encodeURIComponent(item.keyword)}`)
      const updated = keywords.filter((k) => k.id !== item.id && k.keyword !== item.keyword)
      onKeywordsChange(updated)
      setSuccessMsg(`"${item.keyword}" removed from collection`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete keyword')
    } finally {
      setLoading(false)
    }
  }

  const handleSeedDefaults = async () => {
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await apiClient.post<{ keywords?: KeywordItem[]; message?: string }>('/api/keywords/seed', {})
      if (res?.keywords) {
        onKeywordsChange(res.keywords)
        setSuccessMsg('Keywords collection reset to default trending items!')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to seed collection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          p: 1,
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#fff7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LocalFireDepartmentIcon sx={{ color: '#ea580c', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Trending Keywords Collection
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Manage search tags synced directly to the database
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        )}

        {/* Add keyword form */}
        <Box component="form" onSubmit={handleAddKeyword} sx={{ display: 'flex', gap: 1.5, mb: 3, mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Type a new trending keyword (e.g. Dosa, Shawarma, Pasta)"
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !newKeyword.trim()}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{
              bgcolor: '#ea580c',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '12px',
              px: 2.5,
              whiteSpace: 'nowrap',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#c2410c' },
            }}
          >
            Add
          </Button>
        </Box>

        {/* Existing keywords */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
          Active Trending Keywords ({keywords.length})
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            p: 2,
            bgcolor: '#f8fafc',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            minHeight: 100,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {keywords.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#94a3b8', m: 'auto' }}>
              No trending keywords found. Click &quot;Seed Defaults&quot; below.
            </Typography>
          ) : (
            keywords.map((item) => (
              <Chip
                key={item.id || item.keyword}
                label={item.keyword}
                onDelete={() => handleDeleteKeyword(item)}
                sx={{
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  fontWeight: 600,
                  color: '#1e293b',
                  fontSize: '0.85rem',
                  py: 1.8,
                  borderRadius: '10px',
                  '& .MuiChip-deleteIcon': {
                    color: '#ef4444',
                    '&:hover': { color: '#dc2626' },
                  },
                }}
              />
            ))
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handleSeedDefaults}
          disabled={loading}
          startIcon={<RestartAltIcon />}
          size="small"
          sx={{
            color: '#64748b',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { color: '#ea580c', bgcolor: '#fff7ed' },
          }}
        >
          Seed Defaults
        </Button>

        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            borderColor: '#e2e8f0',
            color: '#334155',
            '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}
