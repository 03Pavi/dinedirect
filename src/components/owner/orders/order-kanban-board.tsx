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
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(5, 1fr)',
        },
        gap: 2.5,
        alignItems: 'start',
      }}
    >
      {KANBAN_COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => col.statuses.includes(o.status))

        return (
          <Box
            key={col.id}
            sx={{
              bgcolor: '#f1f5f9',
              borderRadius: '12px',
              p: 1.5,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 230px)',
              minHeight: 480,
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
                  minWidth: 26,
                  bgcolor: col.bgColor,
                  color: col.borderColor,
                  border: `1px solid ${col.borderColor}`,
                  fontSize: '0.74rem',
                }}
              />
            </Box>

            {/* Column Orders List */}
            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                pr: 0.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.8,
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
