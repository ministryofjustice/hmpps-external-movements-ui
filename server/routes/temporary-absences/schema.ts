import { z } from 'zod'
import { differenceInDays } from 'date-fns'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateTransformDate } from '../../utils/validations/validateDatePicker'

const statusEnum = z.enum([
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'PENDING',
  'OVERDUE',
  'EXPIRED',
  'CANCELLED',
  'DENIED',
])

export const schema = createSchema({
  searchTerm: z.string().optional(),
  status: z.union([statusEnum.transform(val => [val]), z.array(statusEnum)]).optional(),
  clear: z.string().optional(),
  start: validateTransformDate(null, 'Enter or select a start date from', 'Enter or select a valid start date from'),
  end: validateTransformDate(null, 'Enter or select a end date to', 'Enter or select a valid end date to'),
  sort: z.string().optional(),
  type: z.string().optional(),
  subType: z.string().optional(),
  reason: z.string().optional(),
  workType: z.string().optional(),
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
  if (start && end) {
    if (end < start) {
      ctx.issues.push({ code: 'custom', message: 'Enter a valid date range', path: ['start'], input: ctx.value })
      ctx.issues.push({ code: 'custom', message: '', path: ['end'], input: ctx.value })
    }

    if (differenceInDays(end, start) > 31) {
      ctx.issues.push({
        code: 'custom',
        message: 'Enter a date range less than 31 days',
        path: ['end'],
        input: ctx.value,
      })
      ctx.issues.push({ code: 'custom', message: '', path: ['start'], input: ctx.value })
    }
  }
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = SchemaType & { validated?: SchemaType }
