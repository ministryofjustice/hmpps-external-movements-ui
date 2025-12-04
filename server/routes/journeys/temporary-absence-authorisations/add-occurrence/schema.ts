import { z } from 'zod'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { format } from 'date-fns'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { validateTransformDate } from '../../../../utils/validations/validateDatePicker'
import { parseHour, parseMinute } from '../../../../utils/validations/validateTime'

export const schema = async (req: Request, _res: Response) =>
  createSchema({
    startDate: z.string().optional(),
    startTimeHour: z.string().optional(),
    startTimeMinute: z.string().optional(),
    returnDate: z.string().optional(),
    returnTimeHour: z.string().optional(),
    returnTimeMinute: z.string().optional(),
  }).transform(({ startDate, startTimeHour, startTimeMinute, returnDate, returnTimeHour, returnTimeMinute }, ctx) => {
    const { fromDate, toDate } = req.journeyData.addTapOccurrence!.authorisation

    const parsedStartDate = validateTransformDate(
      (date: Date) => date.toISOString().substring(0, 10) >= fromDate,
      'Enter or select a start date',
      'Enter or select a valid start date',
      `Start date must be on or after ${format(fromDate, 'd/M/yyyy')}`,
    ).safeParse(startDate)

    parsedStartDate.error?.issues?.forEach(issue =>
      ctx.addIssue({ ...issue, path: ['startDate'] } as $ZodSuperRefineIssue),
    )

    const parsedHour = startTimeHour?.length ? parseHour(startTimeHour) : undefined
    const parsedMinute = startTimeMinute?.length ? parseMinute(startTimeMinute) : undefined

    if (!startTimeHour?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a start time',
        path: ['startTimeHour'],
      })
      if (!startTimeMinute?.length) {
        // empty error message to highlight both input fields with error
        ctx.addIssue({ code: 'custom', message: '', path: ['startTime'] })
      }
    } else if (!startTimeMinute?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a start time',
        path: ['startTimeMinute'],
      })
    }

    if (parsedHour?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Start time hour must be 00 to 23',
        path: ['startTimeHour'],
      })
    }
    if (parsedMinute?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Start time minute must be 00 to 59',
        path: ['startTimeMinute'],
      })
    }

    const parsedReturnDate = validateTransformDate(
      (date: Date) => date.toISOString().substring(0, 10) <= toDate,
      'Enter or select a return date',
      'Enter or select a valid return date',
      `Return date must be on or after ${format(toDate, 'd/M/yyyy')}`,
    ).safeParse(returnDate)

    parsedReturnDate.error?.issues?.forEach(issue =>
      ctx.addIssue({ ...issue, path: ['returnDate'] } as $ZodSuperRefineIssue),
    )

    const parsedReturnHour = returnTimeHour?.length ? parseHour(returnTimeHour) : undefined
    const parsedReturnMinute = returnTimeMinute?.length ? parseMinute(returnTimeMinute) : undefined

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

    if (parsedReturnHour?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Return time hour must be 00 to 23',
        path: ['returnTimeHour'],
      })
    }
    if (parsedReturnMinute?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Return time minute must be 00 to 59',
        path: ['returnTimeMinute'],
      })
    }

    if (parsedStartDate.success && parsedReturnDate.success) {
      if (parsedReturnDate.data < parsedStartDate.data) {
        ctx.addIssue({
          code: 'custom',
          message: 'Return date must be on or before start date',
          path: ['returnDate'],
        })
        return z.NEVER
      }

      if (parsedHour?.success && parsedMinute?.success && parsedReturnHour?.success && parsedReturnMinute?.success) {
        if (
          parsedReturnDate.data === parsedStartDate.data &&
          `${parsedReturnHour.data}:${parsedReturnMinute.data}` <= `${parsedHour.data}:${parsedMinute.data}`
        ) {
          ctx.addIssue({
            code: 'custom',
            message: `Return time must be after start time`,
            path: ['returnTimeHour'],
          })
          // empty error message to highlight both input fields with error
          ctx.addIssue({ code: 'custom', message: '', path: ['returnTime'] })
          return z.NEVER
        }

        return {
          startDate: parsedStartDate.data,
          startTimeHour: parsedHour.data,
          startTimeMinute: parsedMinute.data,
          returnDate: parsedReturnDate.data,
          returnTimeHour: parsedReturnHour.data,
          returnTimeMinute: parsedReturnMinute.data,
        }
      }
    }

    return z.NEVER
  })

export type SchemaType = z.infer<Awaited<ReturnType<typeof schema>>>
