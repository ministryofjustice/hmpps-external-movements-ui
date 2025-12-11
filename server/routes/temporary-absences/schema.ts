import { z } from 'zod'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateTransformOptionalDate } from '../../utils/validations/validateDatePicker'

export const schema = createSchema({
  searchTerm: z.string().optional(),
  status: z.enum(['', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'EXPIRED', 'CANCELLED', 'DENIED']),
  clear: z.string().optional(),
  start: validateTransformOptionalDate('Enter a valid start date from'),
  end: validateTransformOptionalDate('Enter a valid end date to'),
  sort: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return 1
      const num = Number(val)
      if (!Number.isNaN(num)) return num
      return 1
    }),
}).check(ctx => {
  const { start, end } = ctx.value
  if (start && end && end < start) {
    ctx.issues.push({ code: 'custom', message: 'Enter a valid date range', path: ['start'], input: ctx.value })
    ctx.issues.push({ code: 'custom', message: '', path: ['end'], input: ctx.value })
  }
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = SchemaType & { validated?: SchemaType }
