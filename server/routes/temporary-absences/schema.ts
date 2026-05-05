import { z } from 'zod'
import { differenceInDays } from 'date-fns'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateTransformOptionalDate } from '../../utils/validations/validateDatePicker'
import { isPrisonNumber } from '../../utils/utils'

export const TapOccurrenceStatusEnum = z.enum([
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
  searchTerm: z
    .string()
    .optional()
    .transform(val => val?.replace(/[\r\n]/g, '').trim()),
  status: z.union([TapOccurrenceStatusEnum.transform(val => [val]), z.array(TapOccurrenceStatusEnum)]).optional(),
  clear: z.string().optional(),
  start: validateTransformOptionalDate('Enter or select a valid start date from'),
  end: validateTransformOptionalDate('Enter or select a valid end date to'),
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
  const { start, end, searchTerm } = ctx.value
  if (!isPrisonNumber(searchTerm)) {
    if (!start) {
      ctx.issues.push({
        code: 'custom',
        message: 'Enter or select a start date from',
        path: ['start'],
        input: ctx.value,
      })
    }
    if (!end) {
      ctx.issues.push({
        code: 'custom',
        message: 'Enter or select a end date to',
        path: ['end'],
        input: ctx.value,
      })
    }

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
  }
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = SchemaType & { validated?: SchemaType }
