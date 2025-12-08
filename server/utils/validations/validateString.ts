import { z } from 'zod'

export const optionalString = z
  .string()
  .optional()
  .transform(val => (val?.trim().length ? val : null))
