import { z } from 'zod'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateTransformOptionalDate } from '../../utils/validations/validateDatePicker'

export const schema = createSchema({
  searchTerm: z.string().optional(),
  status: z.enum(['', 'PENDING', 'APPROVED', 'CANCELLED', 'DENIED']),
  clear: z.string().optional(),
  fromDate: validateTransformOptionalDate('Enter a valid start date from'),
  toDate: validateTransformOptionalDate('Enter a valid end date to'),
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
  const { fromDate, toDate } = ctx.value
  if (fromDate && toDate && toDate < fromDate) {
    ctx.issues.push({ code: 'custom', message: 'Enter a valid date range', path: ['fromDate'], input: ctx.value })
    ctx.issues.push({ code: 'custom', message: '', path: ['toDate'], input: ctx.value })
  }
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = (SchemaType & { validated?: SchemaType }) | undefined
