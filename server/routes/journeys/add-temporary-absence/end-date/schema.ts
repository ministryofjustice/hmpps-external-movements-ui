import { z } from 'zod'
import { Request, Response } from 'express'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { getMinDateChecker, validateTransformDate } from '../../../../utils/validations/validateDatePicker'
import { parseHour, parseMinute } from '../../../../utils/validations/validateTime'
import { formatInputDate } from '../../../../utils/dateTimeUtils'

export const schema = async (req: Request, _res: Response) => {
  return createSchema({
    endDate: z.string().optional(),
    endTimeHour: z.string().optional(),
    endTimeMinute: z.string().optional(),
  }).transform(({ endDate, endTimeHour, endTimeMinute }, ctx) => {
    const startDate = (req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney?.startDate ??
      req.journeyData.addTemporaryAbsence!.startDate)!
    const startTime = (req.journeyData.addTemporaryAbsence!.startDateTimeSubJourney?.startTime ??
      req.journeyData.addTemporaryAbsence!.startTime)!

    const parsedEndDate = validateTransformDate(
      getMinDateChecker(new Date(startDate)),
      'Enter or select a return date',
      'Enter or select a valid return date',
      `Enter a date that is the same as or later than ${formatInputDate(startDate)}`,
    ).safeParse(endDate)

    parsedEndDate.error?.issues?.forEach(issue => ctx.addIssue({ ...issue, path: ['endDate'] } as $ZodSuperRefineIssue))

    const parsedHour = endTimeHour?.length ? parseHour(endTimeHour) : undefined
    const parsedMinute = endTimeMinute?.length ? parseMinute(endTimeMinute) : undefined

    if (!endTimeHour?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a return time',
        path: ['endTimeHour'],
      })
      if (!endTimeMinute?.length) {
        // empty error message to highlight both input fields with error
        ctx.addIssue({ code: 'custom', message: '', path: ['endTime'] })
      }
    } else if (!endTimeMinute?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a return time',
        path: ['endTimeMinute'],
      })
    }

    if (parsedHour?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Return time hour must be 00 to 23',
        path: ['endTimeHour'],
      })
    }
    if (parsedMinute?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Return time minute must be 00 to 59',
        path: ['endTimeMinute'],
      })
    }

    if (parsedEndDate.success && parsedHour?.success && parsedMinute?.success) {
      if (parsedEndDate.data === startDate && `${parsedHour.data}:${parsedMinute.data}` <= startTime) {
        ctx.addIssue({
          code: 'custom',
          message: `Enter a time that is later than ${startTime}`,
          path: ['endTimeHour'],
        })
        // empty error message to highlight both input fields with error
        ctx.addIssue({ code: 'custom', message: '', path: ['endTime'] })
        return z.NEVER
      }
      return {
        endDate: parsedEndDate.data,
        endTimeHour: parsedHour.data,
        endTimeMinute: parsedMinute.data,
      }
    }
    return z.NEVER
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schema>>>
