import { z } from 'zod'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { differenceInMonths, subDays } from 'date-fns'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { checkTodayOrFuture, validateTransformDate } from '../../../../utils/validations/validateDatePicker'

export const schema = createSchema({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
}).transform(({ fromDate, toDate }, ctx) => {
  const parsedFromDate = validateTransformDate(
    checkTodayOrFuture,
    'Enter or select a first release date',
    'Enter or select a valid first release date',
    'Release date must be today or in the future',
  ).safeParse(fromDate)

  parsedFromDate.error?.issues?.forEach(issue => ctx.addIssue({ ...issue, path: ['fromDate'] } as $ZodSuperRefineIssue))

  const parsedToDate = validateTransformDate(
    checkTodayOrFuture,
    'Enter or select a last return date',
    'Enter or select a valid last return date',
    'Return date must be today or in the future',
  ).safeParse(toDate)

  parsedToDate.error?.issues?.forEach(issue => ctx.addIssue({ ...issue, path: ['toDate'] } as $ZodSuperRefineIssue))

  if (parsedFromDate.success && parsedToDate.success) {
    if (parsedToDate.data <= parsedFromDate.data) {
      ctx.addIssue({
        code: 'custom',
        message: 'Last return date must be later than first release date',
        path: ['toDate'],
      })
      return z.NEVER
    }

    if (differenceInMonths(subDays(new Date(parsedToDate.data), 1), new Date(parsedFromDate.data)) >= 6) {
      ctx.addIssue({
        code: 'custom',
        message: 'Absence period can only extend to 6 months from the entry date',
        path: ['toDate'],
      })
      return z.NEVER
    }

    return {
      fromDate: parsedFromDate.data,
      toDate: parsedToDate.data,
    }
  }
  return z.NEVER
})

export type SchemaType = z.infer<typeof schema>
