'use client'

import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { Order, OrderStatus } from '@/types/order-types'
import { KANBAN_COLUMNS } from './order-config'
import { OrderCard } from './order-card'

interface OrderKanbanBoardProps {
  orders: Order[]
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onOpenMenu: (e: React.MouseEvent<HTMLElement>, order: Order) => void
  onViewDetails: (order: Order) => void
  onCopyOrderId: (id: string) => void
}

export function OrderKanbanBoard({
  orders,
  onUpdateStatus,
  onOpenMenu,
  onViewDetails,
  onCopyOrderId,
}: OrderKanbanBoardProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2.5,
        overflowX: 'auto',
        overflowY: 'hidden',
        pb: 2.5,
        pt: 0.5,
        px: 0.5,
        alignItems: 'stretch',
        /* Custom smooth horizontal scrollbar */
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#e2e8f0',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#94a3b8',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#64748b',
        },
      }}
    >
      {KANBAN_COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => col.statuses.includes(o.status))

        return (
          <Box
            key={col.id}
            sx={{
              flex: '0 0 320px',
              width: 320,
              minWidth: 320,
              bgcolor: '#f8fafc',
              borderRadius: '16px',
              p: 1.8,
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 215px)',
              maxHeight: 'calc(100vh - 215px)',
              minHeight: 500,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Column Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
                px: 0.5,
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '1.1rem' }}>{col.icon}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                  {col.title}
                </Typography>
              </Box>
              <Chip
                label={colOrders.length}
                size="small"
                sx={{
                  fontWeight: 800,
                  height: 22,
                  px: 0.8,
                  bgcolor: col.bgColor,
                  color: col.borderColor,
                  border: `1px solid ${col.borderColor}`,
                  fontSize: '0.74rem',
                }}
              />
            </Box>

            {/* Column Orders List - Scrollable Vertically with Full-Height Cards */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                pr: 0.8,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.8,
                /* Custom smooth vertical scrollbar */
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#cbd5e1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#94a3b8',
                },
              }}
            >
              {colOrders.length === 0 ? (
                <Box
                  sx={{
                    py: 6,
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    borderRadius: '8px',
                    border: '1.5px dashed #cbd5e1',
                    bgcolor: '#ffffff',
                  }}
                >
                  No orders in this stage
                </Box>
              ) : (
                colOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={onUpdateStatus}
                    onOpenMenu={onOpenMenu}
                    onViewDetails={onViewDetails}
                    onCopyOrderId={onCopyOrderId}
                  />
                ))
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
