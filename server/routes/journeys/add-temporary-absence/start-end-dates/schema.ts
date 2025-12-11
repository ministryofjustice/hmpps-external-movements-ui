import { z } from 'zod'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { differenceInMonths, subDays } from 'date-fns'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { checkTodayOrFuture, validateTransformDate } from '../../../../utils/validations/validateDatePicker'

export const schema = createSchema({
  start: z.string().optional(),
  end: z.string().optional(),
}).transform(({ start, end }, ctx) => {
  const parsedStartDate = validateTransformDate(
    checkTodayOrFuture,
    'Enter or select a start date',
    'Enter or select a valid start date',
    'Start date must be today or in the future',
  ).safeParse(start)

  parsedStartDate.error?.issues?.forEach(issue => ctx.addIssue({ ...issue, path: ['start'] } as $ZodSuperRefineIssue))

  const parsedEndDate = validateTransformDate(
    checkTodayOrFuture,
    'Enter or select a return date',
    'Enter or select a valid return date',
    'Return date must be today or in the future',
  ).safeParse(end)

  parsedEndDate.error?.issues?.forEach(issue => ctx.addIssue({ ...issue, path: ['end'] } as $ZodSuperRefineIssue))

  if (parsedStartDate.success && parsedEndDate.success) {
    if (parsedEndDate.data <= parsedStartDate.data) {
      ctx.addIssue({
        code: 'custom',
        message: 'Last return date must be later than first start date',
        path: ['end'],
      })
      return z.NEVER
    }

    if (differenceInMonths(subDays(new Date(parsedEndDate.data), 1), new Date(parsedStartDate.data)) >= 6) {
      ctx.addIssue({
        code: 'custom',
        message: 'Absence period can only extend to 6 months from the entry date',
        path: ['end'],
      })
      return z.NEVER
    }

    return {
      start: parsedStartDate.data,
      end: parsedEndDate.data,
    }
  }
  return z.NEVER
})

export type SchemaType = z.infer<typeof schema>
