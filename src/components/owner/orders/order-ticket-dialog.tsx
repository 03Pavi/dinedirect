'use client'

import React from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import { Order } from '@/types/order-types'
import { STATUS_CONFIGS } from './order-config'

interface OrderTicketDialogProps {
  order: Order | null
  onClose: () => void
}

export function OrderTicketDialog({ order, onClose }: OrderTicketDialogProps) {
  if (!order) return null

  const config = STATUS_CONFIGS[order.status] || STATUS_CONFIGS.PLACED
  const orderTimeFormatted = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  const orderDateFormatted = new Date(order.createdAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })

  return (
    <Dialog
      open={Boolean(order)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Kitchen Order Ticket (KOT)
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Order #{order.id.slice(-8).toUpperCase()} • {orderDateFormatted}, {orderTimeFormatted}
          </Typography>
        </Box>
        <Chip
          label={`${config.icon} ${config.label}`}
          size="small"
          sx={{
            fontWeight: 800,
            bgcolor: config.bgColor,
            color: config.color,
            border: `1px solid ${config.borderColor}`,
          }}
        />
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2 }}>
        {/* Customer Information */}
        <Box sx={{ bgcolor: '#f8fafc', p: 1.8, borderRadius: '8px', mb: 2.5, border: '1px solid #f1f5f9' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
            Customer: {order.customer?.name || 'Walk-In / Customer'}
          </Typography>
          {order.customer?.phone && (
            <Typography variant="body2" sx={{ color: '#475569', mb: 0.3 }}>
              Phone: <strong>{order.customer.phone}</strong>
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Delivery / Table: <strong>{order.address || 'Dine-In Table'}</strong>
          </Typography>
          {order.note && (
            <Box sx={{ mt: 1, p: 1, bgcolor: '#fffbeb', borderRadius: '6px', color: '#b45309', fontWeight: 600, fontSize: '0.82rem' }}>
              💬 Kitchen Note: {order.note}
            </Box>
          )}
        </Box>

        {/* Items Table */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
          Order Items:
        </Typography>
        <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', mb: 2 }}>
          {(order.items || []).map((it, idx) => (
            <Box
              key={it.id || idx}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.2,
                bgcolor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                borderBottom: idx === (order.items || []).length - 1 ? 'none' : '1px solid #f1f5f9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: '#ea580c',
                    bgcolor: '#fff7ed',
                    px: 0.8,
                    py: 0.2,
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                  }}
                >
                  {it.quantity}x
                </Typography>
                <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                  {it.name}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>
                ₹{it.price * it.quantity}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Totals */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
            <span>Payment Mode:</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{order.paymentMode || 'CASH'}</span>
          </Box>
          {order.deliveryFee > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
              <span>Delivery / Packaging Fee:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{order.deliveryFee}</span>
            </Box>
          )}
          <Divider sx={{ my: 0.8 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            <span>Grand Total:</span>
            <span>₹{order.totalAmount}</span>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
        >
          Print Ticket
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={onClose}
          sx={{ borderRadius: '8px', bgcolor: '#0f172a', textTransform: 'none', fontWeight: 700 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
