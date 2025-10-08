import { Request } from 'express'
import z from 'zod'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { addDays, format, differenceInDays } from 'date-fns'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { validateTransformDate } from '../../../../utils/validations/validateDatePicker'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { getSelectDayRange } from './utils'
import { parseHour, parseMinute } from '../../../../utils/validations/validateTime'

const absenceDateTimeSchema = (fromDate: string, toDate: string, maxReturnDate: string) =>
  createSchema({
    startDate: z.string().optional(),
    startTimeHour: z.string().optional(),
    startTimeMinute: z.string().optional(),
    returnDate: z.string().optional(),
    returnTimeHour: z.string().optional(),
    returnTimeMinute: z.string().optional(),
  }).transform(({ startDate, returnDate, startTimeHour, startTimeMinute, returnTimeHour, returnTimeMinute }, ctx) => {
    const parsedStartDate = validateTransformDate(
      (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd')
        return dateString >= fromDate && dateString <= toDate
      },
      'Enter or select a release date',
      'Enter or select a valid release date',
      `Release date must be between ${formatInputDate(fromDate)} and ${formatInputDate(toDate)}`,
    ).safeParse(startDate)

    parsedStartDate.error?.issues?.forEach(issue =>
      ctx.addIssue({ ...issue, path: ['startDate'] } as $ZodSuperRefineIssue),
    )

    const parsedReturnDate = validateTransformDate(
      (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd')
        return dateString >= fromDate && dateString <= maxReturnDate
      },
      'Enter or select a return date',
      'Enter or select a valid return date',
      `Return date must be between ${formatInputDate(fromDate)} and ${formatInputDate(maxReturnDate)}`,
    ).safeParse(returnDate)

    parsedReturnDate.error?.issues?.forEach(issue =>
      ctx.addIssue({ ...issue, path: ['returnDate'] } as $ZodSuperRefineIssue),
    )

    const parsedStartHour = startTimeHour?.length ? parseHour(startTimeHour) : undefined
    const parsedStartMinute = startTimeMinute?.length ? parseMinute(startTimeMinute) : undefined

    if (!startTimeHour?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a release time',
        path: ['startTimeHour'],
      })
      if (!startTimeMinute?.length) {
        // empty error message to highlight both input fields with error
        ctx.addIssue({ code: 'custom', message: '', path: ['startTime'] })
      }
    } else if (!startTimeMinute?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a release time',
        path: ['startTimeMinute'],
      })
    }

    if (parsedStartHour?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Release time hour must be 00 to 23',
        path: ['startTimeHour'],
      })
    }
    if (parsedStartMinute?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Release time minute must be 00 to 59',
        path: ['startTimeMinute'],
      })
    }

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
          message: 'Return date must be equal to or later than release date',
          path: ['returnDate'],
        })
        return z.NEVER
      }

      if (differenceInDays(parsedReturnDate.data, parsedStartDate.data) > 1) {
        ctx.addIssue({
          code: 'custom',
          message: 'Return date must be the same day or one day after release date',
          path: ['returnDate'],
        })
        return z.NEVER
      }
    }

    if (
      parsedStartDate.success &&
      parsedReturnDate.success &&
      parsedStartHour?.success &&
      parsedStartMinute?.success &&
      parsedReturnHour?.success &&
      parsedReturnMinute?.success
    ) {
      if (
        parsedStartDate.data === parsedReturnDate.data &&
        `${parsedReturnHour.data}:${parsedReturnMinute.data}` <= `${parsedStartHour.data}:${parsedStartMinute.data}`
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Return time must be later than release time',
          path: ['returnTimeHour'],
        })
        // empty error message to highlight both input fields with error
        ctx.addIssue({ code: 'custom', message: '', path: ['returnTime'] })
        return z.NEVER
      }

      return {
        startDate: parsedStartDate.data,
        returnDate: parsedReturnDate.data,
        startTimeHour: parsedStartHour.data,
        startTimeMinute: parsedStartMinute.data,
        returnTimeHour: parsedReturnHour.data,
        returnTimeMinute: parsedReturnMinute.data,
      }
    }

    return z.NEVER
  })

export const schema = async (
  req: Request<
    { idx?: string },
    unknown,
    {
      save?: string
      absences?: {
        startDate?: string
        startTimeHour?: string
        startTimeMinute?: string
        returnDate?: string
        returnTimeHour?: string
        returnTimeMinute?: string
      }[]
    }
  >,
) => {
  const isAllBlank = req.body.absences?.every(
    absence =>
      absence.startDate === '' &&
      absence.startTimeHour === '' &&
      absence.startTimeMinute === '' &&
      absence.returnDate === '' &&
      absence.returnTimeHour === '' &&
      absence.returnTimeMinute === '',
  )

  const { startDate: fromDate, endDate: toDate } = getSelectDayRange(req)
  const maxReturnDate = format(addDays(new Date(toDate), 1), 'yyyy-MM-dd')

  return createSchema({
    absences: z.array(
      req.body.save === undefined || isAllBlank
        ? z.object({
            startDate: z.string().optional(),
            startTimeHour: z.string().optional(),
            startTimeMinute: z.string().optional(),
            returnDate: z.string().optional(),
            returnTimeHour: z.string().optional(),
            returnTimeMinute: z.string().optional(),
          })
        : absenceDateTimeSchema(fromDate, toDate, maxReturnDate),
    ),
    save: z.string().optional(),
    add: z.string().optional(),
    remove: z.string().optional(),
  }).transform(val => ({
    ...val,
    absences: isAllBlank
      ? []
      : val.absences.map(
          ({ startDate, startTimeHour, startTimeMinute, returnDate, returnTimeHour, returnTimeMinute }) => ({
            startDate: startDate!,
            startTimeHour: startTimeHour!,
            startTimeMinute: startTimeMinute!,
            returnDate: returnDate!,
            returnTimeHour: returnTimeHour!,
            returnTimeMinute: returnTimeMinute!,
          }),
        ),
  }))
}

export type SchemaType = z.infer<Awaited<ReturnType<typeof schema>>>
