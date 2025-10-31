import { format, isValid, parseISO } from 'date-fns'

export const formatInputDate = (value?: string) => value && format(new Date(Date.parse(value)), 'd/L/yyyy')

export const formatDate = (date?: string | Date, fmt = 'd MMMM yyyy') => {
  if (!date) return undefined
  const richDate = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(richDate)) return undefined
  return format(richDate, fmt)
}

export const formatTime = (date?: string) => {
  return date?.substring(9, 14) || ''
}

export const addDaysMonths = (dateString: string, plusDays: number = 0, plusMonth: number = 0) => {
  const date = new Date(dateString)
  if (plusDays !== 0) date.setDate(date.getDate() + plusDays)
  if (plusMonth !== 0) date.setMonth(date.getMonth() + plusMonth)
  return format(date, 'yyyy-MM-dd')
}

export const inputDate = (plusDays: number = 0, plusMonth: number = 0) => {
  const date = new Date()
  if (plusDays !== 0) date.setDate(date.getDate() + plusDays)
  if (plusMonth !== 0) date.setMonth(date.getMonth() + plusMonth)
  return format(date, 'd/M/yyyy')
}

export const absenceTimeRange = ({ releaseAt, returnBy }: { releaseAt: string; returnBy: string }) => {
  if (releaseAt.substring(0, 10) === returnBy.substring(0, 10)) {
    return `${format(releaseAt, 'cccc, d MMMM')} (${format(releaseAt, 'HH:mm')} to ${format(returnBy, 'HH:mm')})`
  }
  return `${format(releaseAt, 'cccc, d MMMM')} to ${format(returnBy, 'cccc, d MMMM')} (${format(releaseAt, 'HH:mm')} to ${format(returnBy, 'HH:mm')})`
}
