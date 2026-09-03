import { z } from 'zod'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { differenceInMonths, format, subDays } from 'date-fns'
import { Request, Response } from 'express'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'
import { validateTransformDate } from '../../../../../utils/validations/validateDatePicker'

export const schema = async (req: Request, _res: Response) =>
  createSchema({
    start: z.string().optional(),
    end: z.string().optional(),
  }).transform(({ start, end }, ctx) => {
    const firstStartDate = req.journeyData
      .updateTapAuthorisation!.authorisation.occurrences.reduce((acc, itm) => {
        if ((!acc || itm.start < acc) && itm.status.code !== 'CANCELLED') return itm.start
        return acc
      }, '')
      .substring(0, 10)
    const lastEndDate = req.journeyData
      .updateTapAuthorisation!.authorisation.occurrences.reduce((acc, itm) => {
        if ((!acc || itm.end > acc) && itm.status.code !== 'CANCELLED') return itm.end
        return acc
      }, '')
      .substring(0, 10)

    const parsedStartDate = validateTransformDate(
      (date: Date) => date.toISOString().substring(0, 10) <= firstStartDate,
      'Enter or select a start date',
      'Enter or select a valid start date',
      `The start date must be on or before the first occurrence ${format(firstStartDate, 'd/M/yyyy')}`,
    ).safeParse(start)

    parsedStartDate.error?.issues?.forEach(issue => ctx.addIssue({ ...issue, path: ['start'] } as $ZodSuperRefineIssue))

    const parsedEndDate = validateTransformDate(
      (date: Date) => date.toISOString().substring(0, 10) >= lastEndDate,
      'Enter or select a return date',
      'Enter or select a valid return date',
      `The end date must be on or after the last occurrence ${format(lastEndDate, 'd/M/yyyy')}`,
    ).safeParse(end)

    parsedEndDate.error?.issues?.forEach(issue => ctx.addIssue({ ...issue, path: ['end'] } as $ZodSuperRefineIssue))

    if (parsedStartDate.success && parsedEndDate.success) {
      if (parsedEndDate.data < parsedStartDate.data) {
        ctx.addIssue({
          code: 'custom',
          message: 'Last return date must be the same or later than first start date',
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

export type SchemaType = z.infer<Awaited<ReturnType<typeof schema>>>
