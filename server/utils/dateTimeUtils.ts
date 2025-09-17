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

export const todayStringGBFormat = () => DATE_FORMAT_GB.format(new Date())

export const yesterdayStringGBFormat = () => {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - 1)
  return DATE_FORMAT_GB.format(currentDate)
}
