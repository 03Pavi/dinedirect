import { OrderStatus } from '@/types/order-types'

export interface StatusConfig {
  label: string
  badgeLabel: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  nextStatus?: OrderStatus
  nextActionLabel?: string
  nextActionColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
}

export const STATUS_CONFIGS: Record<OrderStatus, StatusConfig> = {
  PLACED: {
    label: 'New Placed',
    badgeLabel: 'New',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    icon: '🔔',
    nextStatus: 'PREPARING',
    nextActionLabel: 'Accept & Prepare 🍳',
    nextActionColor: 'primary',
  },
  ACCEPTED: {
    label: 'Accepted',
    badgeLabel: 'Accepted',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    icon: '📋',
    nextStatus: 'PREPARING',
    nextActionLabel: 'Start Preparing 🍳',
    nextActionColor: 'info',
  },
  PREPARING: {
    label: 'Preparing',
    badgeLabel: 'Cooking',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    icon: '🍳',
    nextStatus: 'READY',
    nextActionLabel: 'Mark as Ready 🛎️',
    nextActionColor: 'success',
  },
  READY: {
    label: 'Ready for Pickup',
    badgeLabel: 'Ready',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    icon: '🛎️',
    nextStatus: 'OUT_FOR_DELIVERY',
    nextActionLabel: 'Mark as Picked Up 🛵',
    nextActionColor: 'success',
  },
  OUT_FOR_DELIVERY: {
    label: 'Picked Up / En Route',
    badgeLabel: 'Picked Up',
    color: '#0d9488',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
    icon: '🛵',
    nextStatus: 'DELIVERED',
    nextActionLabel: 'Mark as Delivered ✅',
    nextActionColor: 'success',
  },
  DELIVERED: {
    label: 'Completed',
    badgeLabel: 'Delivered',
    color: '#334155',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
    icon: '✅',
  },
  REJECTED: {
    label: 'Rejected',
    badgeLabel: 'Rejected',
    color: '#e11d48',
    bgColor: '#fff1f2',
    borderColor: '#fecdd3',
    icon: '❌',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeLabel: 'Cancelled',
    color: '#64748b',
    bgColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    icon: '⚠️',
  },
}

export interface KanbanColumn {
  id: string
  title: string
  icon: string
  statuses: OrderStatus[]
  borderColor: string
  bgColor: string
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'col-new',
    title: 'Incoming / New',
    icon: '🔔',
    statuses: ['PLACED', 'ACCEPTED'],
    borderColor: '#ea580c',
    bgColor: '#fff7ed',
  },
  {
    id: 'col-preparing',
    title: 'In Kitchen (Preparing)',
    icon: '🍳',
    statuses: ['PREPARING'],
    borderColor: '#7c3aed',
    bgColor: '#f5f3ff',
  },
  {
    id: 'col-ready',
    title: 'Ready for Pickup',
    icon: '🛎️',
    statuses: ['READY'],
    borderColor: '#16a34a',
    bgColor: '#f0fdf4',
  },
  {
    id: 'col-picked-up',
    title: 'Picked Up / Out',
    icon: '🛵',
    statuses: ['OUT_FOR_DELIVERY'],
    borderColor: '#0d9488',
    bgColor: '#f0fdfa',
  },
  {
    id: 'col-completed',
    title: 'Delivered / Done',
    icon: '✅',
    statuses: ['DELIVERED'],
    borderColor: '#64748b',
    bgColor: '#f8fafc',
  },
]

export const formatElapsed = (dateStr: string): string => {
  try {
    const now = new Date().getTime()
    const orderTime = new Date(dateStr).getTime()
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60))
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes === 1) return '1 min ago'
    if (diffMinutes < 60) return `${diffMinutes} mins ago`
    const hours = Math.floor(diffMinutes / 60)
    return `${hours}h ${diffMinutes % 60}m ago`
  } catch {
    return ''
  }
}
