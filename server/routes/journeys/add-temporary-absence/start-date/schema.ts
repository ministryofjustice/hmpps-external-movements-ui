import { z } from 'zod'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { checkTodayOrFuture, validateTransformDate } from '../../../../utils/validations/validateDatePicker'
import { parseHour, parseMinute } from '../../../../utils/validations/validateTime'

export const schema = createSchema({
  startDate: z.string().optional(),
  startTimeHour: z.string().optional(),
  startTimeMinute: z.string().optional(),
}).transform(({ startDate, startTimeHour, startTimeMinute }, ctx) => {
  const parsedStartDate = validateTransformDate(
    checkTodayOrFuture,
    'Enter or select a release date',
    'Enter or select a valid release date',
    'Release date must be today or in the future',
  ).safeParse(startDate)

  parsedStartDate.error?.issues?.forEach(issue =>
    ctx.addIssue({ ...issue, path: ['startDate'] } as $ZodSuperRefineIssue),
  )

  const parsedHour = startTimeHour?.length ? parseHour(startTimeHour) : undefined
  const parsedMinute = startTimeMinute?.length ? parseMinute(startTimeMinute) : undefined

  if (!startTimeHour?.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a release time',
      path: ['startTimeHour'],
    })
  } else if (!startTimeMinute?.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a release time',
      path: ['startTimeMinute'],
    })
  } else {
    if (!parsedHour?.success) {
      ctx.addIssue({
        code: 'custom',
        message: 'Release time hour must be 00 to 23',
        path: ['startTimeHour'],
      })
    }
    if (!parsedMinute?.success) {
      ctx.addIssue({
        code: 'custom',
        message: 'Release time minute must be 00 to 59',
        path: ['startTimeMinute'],
      })
    }
  }
  if (parsedStartDate.success && parsedHour?.success && parsedMinute?.success) {
    return {
      startDate: parsedStartDate.data,
      startTimeHour: parsedHour.data,
      startTimeMinute: parsedMinute.data,
    }
  }
  return z.NEVER
})

export type SchemaType = z.infer<typeof schema>
