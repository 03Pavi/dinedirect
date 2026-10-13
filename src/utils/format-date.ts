import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export function formatDate(date: string | Date | number, format = 'DD MMM YYYY, hh:mm A'): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function formatTimeAgo(date: string | Date | number): string {
  if (!date) return ''
  return dayjs(date).fromNow()
}
