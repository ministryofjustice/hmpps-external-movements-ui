import { format, isValid, parseISO } from 'date-fns'

const DATE_FORMAT_GB = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

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

export const todayStringGBFormat = () => DATE_FORMAT_GB.format(new Date())

export const yesterdayStringGBFormat = () => {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - 1)
  return DATE_FORMAT_GB.format(currentDate)
}

export const isoDate = (plusDays: number = 0, plusMonth: number = 0) => {
  const date = new Date()
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

export const parseDatePickerMinDate = (date: string) => {
  const currentDate = new Date(date)
  currentDate.setDate(currentDate.getDate() - 1)
  return DATE_FORMAT_GB.format(currentDate)
}
