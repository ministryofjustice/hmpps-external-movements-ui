import { z } from 'zod'
import { Request, Response } from 'express'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { format } from 'date-fns'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'
import { getMinDateChecker, validateTransformDate } from '../../../../../utils/validations/validateDatePicker'
import { parseHour, parseMinute } from '../../../../../utils/validations/validateTime'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'

export const schema = async (req: Request, _res: Response) => {
  return createSchema({
    returnDate: z.string().optional(),
    returnTimeHour: z.string().optional(),
    returnTimeMinute: z.string().optional(),
  }).transform(({ returnDate, returnTimeHour, returnTimeMinute }, ctx) => {
    const journey = req.journeyData.updateTapOccurrence!

    let startDate: string
    let startTime: string

    if (journey.changeType === 'start-date') {
      startDate = journey.startDate!
      startTime = journey.startTime!
    } else {
      startDate = format(journey.occurrence.releaseAt, 'yyyy-MM-dd')
      startTime = format(journey.occurrence.releaseAt, 'HH:mm')
    }

    const parsedReturnDate = validateTransformDate(
      getMinDateChecker(new Date(startDate)),
      'Enter or select a return date',
      'Enter or select a valid return date',
      `Enter a date that is the same as or later than ${formatInputDate(startDate)}`,
    ).safeParse(returnDate)

    parsedReturnDate.error?.issues?.forEach(issue =>
      ctx.addIssue({ ...issue, path: ['returnDate'] } as $ZodSuperRefineIssue),
    )

    const parsedHour = returnTimeHour?.length ? parseHour(returnTimeHour) : undefined
    const parsedMinute = returnTimeMinute?.length ? parseMinute(returnTimeMinute) : undefined

    if (!returnTimeHour?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a return time',
        path: ['returnTimeHour'],
      })
      if (!returnTimeMinute?.length) {
        // empty error message to highlight both input fields with error
        ctx.addIssue({ code: 'custom', message: '', path: ['returnTime'] })
      }
    } else if (!returnTimeMinute?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a return time',
        path: ['returnTimeMinute'],
      })
    }

    if (parsedHour?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Return time hour must be 00 to 23',
        path: ['returnTimeHour'],
      })
    }
    if (parsedMinute?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Return time minute must be 00 to 59',
        path: ['returnTimeMinute'],
      })
    }

    if (parsedReturnDate.success && parsedHour?.success && parsedMinute?.success) {
      if (parsedReturnDate.data === startDate && `${parsedHour.data}:${parsedMinute.data}` <= startTime) {
        ctx.addIssue({
          code: 'custom',
          message: `Enter a time that is later than ${startTime}`,
          path: ['returnTimeHour'],
        })
        // empty error message to highlight both input fields with error
        ctx.addIssue({ code: 'custom', message: '', path: ['returnTime'] })
        return z.NEVER
      }
      return {
        returnDate: parsedReturnDate.data,
        returnTimeHour: parsedHour.data,
        returnTimeMinute: parsedMinute.data,
      }
    }
    return z.NEVER
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schema>>>
