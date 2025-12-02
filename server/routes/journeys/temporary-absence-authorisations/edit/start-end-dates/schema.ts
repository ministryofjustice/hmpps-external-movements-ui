import { z } from 'zod'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { differenceInMonths, format, subDays } from 'date-fns'
import { Request, Response } from 'express'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'
import { validateTransformDate } from '../../../../../utils/validations/validateDatePicker'

export const schema = async (req: Request, _res: Response) =>
  createSchema({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
  }).transform(({ fromDate, toDate }, ctx) => {
    const firstStartDate = req.journeyData
      .updateTapAuthorisation!.authorisation.occurrences.reduce((acc, itm) => {
        if (!acc || itm.releaseAt < acc) return itm.releaseAt
        return acc
      }, '')
      .substring(0, 10)
    const lastEndDate = req.journeyData
      .updateTapAuthorisation!.authorisation.occurrences.reduce((acc, itm) => {
        if (!acc || itm.returnBy > acc) return itm.returnBy
        return acc
      }, '')
      .substring(0, 10)

    const parsedFromDate = validateTransformDate(
      (date: Date) => date.toISOString().substring(0, 10) <= firstStartDate,
      'Enter or select a start date',
      'Enter or select a valid start date',
      `The start date must be on or before the first occurrence ${format(firstStartDate, 'd/M/yyyy')}`,
    ).safeParse(fromDate)

    parsedFromDate.error?.issues?.forEach(issue =>
      ctx.addIssue({ ...issue, path: ['fromDate'] } as $ZodSuperRefineIssue),
    )

    const parsedToDate = validateTransformDate(
      (date: Date) => date.toISOString().substring(0, 10) >= lastEndDate,
      'Enter or select a return date',
      'Enter or select a valid return date',
      `The end date must be on or after the last occurrence ${format(lastEndDate, 'd/M/yyyy')}`,
    ).safeParse(toDate)

    parsedToDate.error?.issues?.forEach(issue => ctx.addIssue({ ...issue, path: ['toDate'] } as $ZodSuperRefineIssue))

    if (parsedFromDate.success && parsedToDate.success) {
      if (parsedToDate.data < parsedFromDate.data) {
        ctx.addIssue({
          code: 'custom',
          message: 'Last return date must be the same or later than first start date',
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

export type SchemaType = z.infer<Awaited<ReturnType<typeof schema>>>
