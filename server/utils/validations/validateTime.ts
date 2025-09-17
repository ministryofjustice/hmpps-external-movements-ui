import { z } from 'zod'

const RESULT_VALIDATOR = z.string().min(1)

const parseNumber = (value: string, min: number, max: number, length: number) => {
  const numValue = Number(value)

  if (Number.isNaN(numValue) || numValue < min || numValue > max) {
    return RESULT_VALIDATOR.safeParse(null)
  }

  return RESULT_VALIDATOR.safeParse(numValue.toString().padStart(length, '0'))
}

export const parseHour = (value: string) => parseNumber(value, 0, 23, 2)

export const parseMinute = (value: string) => parseNumber(value, 0, 59, 2)
