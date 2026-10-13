'use client'

import React from 'react'
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Card,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PhoneIcon from '@mui/icons-material/Phone'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'

import { Order, OrderStatus } from '@/types/order-types'
import { STATUS_CONFIGS, formatElapsed } from './order-config'

interface OrderCardProps {
  order: Order
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onOpenMenu: (e: React.MouseEvent<HTMLElement>, order: Order) => void
  onViewDetails: (order: Order) => void
  onCopyOrderId: (id: string) => void
}

export function OrderCard({
  order,
  onUpdateStatus,
  onOpenMenu,
  onViewDetails,
  onCopyOrderId,
}: OrderCardProps) {
  const config = STATUS_CONFIGS[order.status] || STATUS_CONFIGS.PLACED
  const formattedId = `#${order.id.slice(-6).toUpperCase()}`
  const elapsed = formatElapsed(order.createdAt)

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: '1.5px solid',
        borderColor: order.status === 'PLACED' ? '#f97316' : '#e2e8f0',
        bgcolor: '#ffffff',
        p: 2.2,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        boxShadow: order.status === 'PLACED' ? '0 4px 14px rgba(249, 115, 22, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          borderColor: config.color,
        },
      }}
    >
      {/* Top Header: ID, Elapsed & Status Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
            onClick={() => onCopyOrderId(order.id)}
            title="Click to copy full ID"
          >
            {formattedId}
          </Typography>
          <Tooltip title="Copy full Order ID">
            <IconButton size="small" onClick={() => onCopyOrderId(order.id)} sx={{ p: 0.3, color: '#94a3b8' }}>
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Chip
            size="small"
            icon={<AccessTimeIcon sx={{ fontSize: '13px !important' }} />}
            label={elapsed}
            sx={{
              fontSize: '0.72rem',
              height: 22,
              bgcolor: '#f8fafc',
              color: '#64748b',
              fontWeight: 600,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            size="small"
            label={`${config.icon} ${config.badgeLabel}`}
            sx={{
              fontWeight: 800,
              fontSize: '0.74rem',
              height: 24,
              bgcolor: config.bgColor,
              color: config.color,
              border: `1px solid ${config.borderColor}`,
            }}
          />
          <IconButton
            size="small"
            onClick={(e) => onOpenMenu(e, order)}
            sx={{ p: 0.5, color: '#64748b' }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Customer & Location Details */}
      <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: '8px', mb: 1.5, border: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
            👤 {order.customer?.name || 'Customer'}
          </Typography>
          {order.customer?.phone && (
            <Box
              component="a"
              href={`tel:${order.customer.phone}`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.76rem',
                color: '#ea580c',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <PhoneIcon sx={{ fontSize: 13 }} />
              <span>{order.customer.phone}</span>
            </Box>
          )}
        </Box>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 500 }}>
          📍 {order.address || 'Table / Dine In'}
        </Typography>
      </Box>

      {/* Items List */}
      <Box sx={{ mb: 1.5, flexGrow: 1 }}>
        <Stack spacing={0.6}>
          {(order.items || []).map((it, idx) => (
            <Box
              key={it.id || idx}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
                py: 0.2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 800,
                    color: '#ea580c',
                    bgcolor: '#fff7ed',
                    px: 0.8,
                    py: 0.1,
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    minWidth: 24,
                    textAlign: 'center',
                  }}
                >
                  {it.quantity}x
                </Typography>
                <Typography sx={{ color: '#0f172a', fontWeight: 600, fontSize: '0.84rem' }}>
                  {it.name}
                </Typography>
              </Box>
              <Typography sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.82rem' }}>
                ₹{it.price * it.quantity}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Customer Note / Special Instructions */}
      {order.note && (
        <Box
          sx={{
            bgcolor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '6px',
            p: 1,
            mb: 1.5,
            fontSize: '0.76rem',
            color: '#b45309',
            fontWeight: 600,
          }}
        >
          💬 <strong>Note:</strong> {order.note}
        </Box>
      )}

      <Divider sx={{ mb: 1.5, borderColor: '#f1f5f9' }} />

      {/* Total & Payment Mode */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Chip
            size="small"
            label={order.paymentMode || 'CASH'}
            sx={{
              fontSize: '0.7rem',
              height: 20,
              fontWeight: 700,
              bgcolor: '#f1f5f9',
              color: '#475569',
            }}
          />
          {order.deliveryFee > 0 && (
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              +₹{order.deliveryFee} del
            </Typography>
          )}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
          ₹{order.totalAmount}
        </Typography>
      </Box>

      {/* Action Buttons: Next Status Progression */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {order.status === 'PLACED' && (
          <>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onUpdateStatus(order.id, 'REJECTED')}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                py: 0.6,
                flexShrink: 0,
              }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => onUpdateStatus(order.id, 'PREPARING')}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                py: 0.7,
                bgcolor: '#ea580c',
                '&:hover': { bgcolor: '#c2410c' },
              }}
            >
              Accept & Prepare 🍳
            </Button>
          </>
        )}

        {order.status === 'ACCEPTED' && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => onUpdateStatus(order.id, 'PREPARING')}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              py: 0.7,
              bgcolor: '#7c3aed',
              '&:hover': { bgcolor: '#6d28d9' },
            }}
          >
            Start Preparing 🍳
          </Button>
        )}

        {order.status === 'PREPARING' && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => onUpdateStatus(order.id, 'READY')}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              py: 0.7,
              bgcolor: '#16a34a',
              '&:hover': { bgcolor: '#15803d' },
            }}
          >
            Mark as Ready 🛎️
          </Button>
        )}

        {order.status === 'READY' && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => onUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              py: 0.7,
              bgcolor: '#0d9488',
              '&:hover': { bgcolor: '#0f766e' },
            }}
          >
            Mark as Picked Up 🛵
          </Button>
        )}

        {order.status === 'OUT_FOR_DELIVERY' && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              py: 0.7,
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
            }}
          >
            Mark as Delivered ✅
          </Button>
        )}

        {order.status === 'DELIVERED' && (
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
              py: 0.6,
              borderRadius: '6px',
              bgcolor: '#f1f5f9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            Delivered Successfully
          </Box>
        )}

        {(order.status === 'REJECTED' || order.status === 'CANCELLED') && (
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
              py: 0.6,
              borderRadius: '6px',
              bgcolor: '#fff1f2',
              color: '#e11d48',
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            {order.status === 'REJECTED' ? 'Order Rejected' : 'Order Cancelled'}
          </Box>
        )}

        {/* View Details / Ticket Button */}
        <Tooltip title="View Receipt & Kitchen Ticket (KOT)">
          <IconButton
            size="small"
            onClick={() => onViewDetails(order)}
            sx={{
              borderRadius: '8px',
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#475569',
              p: 0.7,
            }}
          >
            <ReceiptLongIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  )
}
