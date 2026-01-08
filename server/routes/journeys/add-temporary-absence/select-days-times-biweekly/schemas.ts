import z from 'zod'
import { Request } from 'express'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import {
  addBeforeErrors,
  addEmptyHHMMErrors,
  addInvalidHHMMErrors,
  parseHour,
  parseMinute,
} from '../../../../utils/validations/validateTime'
import { AddTemporaryAbsenceJourney } from '../../../../@types/journeys'

const ERROR_NO_DAYS = 'Select at least one day'

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const schemaFactory = (week: 'FIRST' | 'SECOND') => async (req: Request) =>
  createSchema({
    days: z.array(
      z.object({
        checked: z.string().optional(),
        releaseHour: z.string().optional(),
        releaseMinute: z.string().optional(),
        returnHour: z.string().optional(),
        returnMinute: z.string().optional(),
        isOvernight: z.string().optional(),
      }),
    ),
    selectedDays: z.union([z.string(), z.array(z.string())]).optional(),
  }).transform((data, ctx) => {
    if (!data.selectedDays?.length) {
      ctx.addIssue({
        code: 'custom',
        message: ERROR_NO_DAYS,
        path: ['selectedDays'],
      })
    }
    return data.days
      .map((day, i) => {
        if (!data.selectedDays?.includes(weekDays[i]!)) {
          return undefined
        }

        const isOvernight = day.isOvernight === 'true'

        const releaseHour = day.releaseHour ? parseHour(day.releaseHour) : undefined
        const releaseMinute = day.releaseMinute ? parseMinute(day.releaseMinute) : undefined

        const returnHour = day.returnHour ? parseHour(day.returnHour) : undefined
        const returnMinute = day.returnMinute ? parseMinute(day.returnMinute) : undefined

        addInvalidHHMMErrors(ctx, 'release', releaseHour, releaseMinute, ['days', i])
        addEmptyHHMMErrors(ctx, 'release', releaseHour, releaseMinute, ['days', i])

        const otherWeek =
          (week === 'FIRST'
            ? req.journeyData.addTemporaryAbsence!.biweeklyPattern?.weekB
            : req.journeyData.addTemporaryAbsence!.biweeklyPattern?.weekA) ?? []

        if (i === 6) {
          const nextDay = otherWeek.find(itm => itm.day === 0)
          if (
            nextDay &&
            isOvernight &&
            returnHour &&
            returnMinute &&
            `${returnHour?.data}:${returnMinute?.data}` > nextDay.startTime
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'The overnight return time must be earlier than the start time of the next day',
              path: ['days', i, 'returnHour'],
            })
            ctx.addIssue({
              code: 'custom',
              message: '',
              path: ['days', i, 'returnMinute'],
            })
          }
        }

        const previousDayIndex = i === 0 ? 6 : i - 1
        if (previousDayIndex === 6) {
          const previousDay = otherWeek.find(itm => itm.day === 6)
          if (
            previousDay?.overnight &&
            releaseHour &&
            releaseMinute &&
            previousDay.returnTime > `${releaseHour?.data}:${releaseMinute?.data}`
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'The start time must be later than the overnight return time',
              path: ['days', i, 'releaseHour'],
            })
            ctx.addIssue({
              code: 'custom',
              message: '',
              path: ['days', i, 'releaseMinute'],
            })
          }
        } else if (data.selectedDays?.includes(weekDays[previousDayIndex]!) && data.days[previousDayIndex]) {
          // If the previous day was filled out - we need to check that the previous day's overnight time is not after the current day's release time
          const previousDayOvernightHour =
            data.days[previousDayIndex]['isOvernight'] && data.days[previousDayIndex]['returnHour']
          const previousDayOvernightMinute =
            data.days[previousDayIndex]['isOvernight'] && data.days[previousDayIndex]['returnMinute']

          if (previousDayOvernightHour && previousDayOvernightMinute && releaseHour && releaseMinute) {
            const previousDayReleaseTime = Number(previousDayOvernightHour) * 60 + Number(previousDayOvernightMinute)
            const dayReleaseTime = Number(releaseHour.data) * 60 + Number(releaseMinute.data)

            if (previousDayReleaseTime > dayReleaseTime) {
              ctx.addIssue({
                code: 'custom',
                message: 'The start time must be later than the overnight return time',
                path: ['days', i, 'releaseHour'],
              })
              ctx.addIssue({
                code: 'custom',
                message: '',
                path: ['days', i, 'releaseMinute'],
              })
            }
          }
        }

        addInvalidHHMMErrors(ctx, 'return', returnHour, returnMinute, ['days', i])
        addEmptyHHMMErrors(ctx, 'return', returnHour, returnMinute, ['days', i])

        if (!isOvernight && releaseHour && releaseMinute && returnHour && returnMinute) {
          addBeforeErrors(ctx, releaseHour!, releaseMinute!, returnHour!, returnMinute!, ['days', i])
        }

        return {
          day: i,
          overnight: isOvernight,
          startTime: `${releaseHour?.data}:${releaseMinute?.data}`,
          returnTime: `${returnHour?.data}:${returnMinute?.data}`,
        } as Required<AddTemporaryAbsenceJourney>['weeklyPattern']['0']
      })
      .filter(o => o?.day !== undefined) as Required<AddTemporaryAbsenceJourney>['weeklyPattern']
  })

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
