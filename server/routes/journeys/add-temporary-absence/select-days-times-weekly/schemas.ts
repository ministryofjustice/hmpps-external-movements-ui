import z from 'zod'
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

export const schema = createSchema({
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

      const releaseHour = day.releaseHour ? parseHour(day.releaseHour) : undefined
      const releaseMinute = day.releaseMinute ? parseMinute(day.releaseMinute) : undefined

      const returnHour = day.returnHour ? parseHour(day.returnHour) : undefined
      const returnMinute = day.returnMinute ? parseMinute(day.returnMinute) : undefined

      addInvalidHHMMErrors(ctx, 'release', releaseHour, releaseMinute, ['days', i])
      addEmptyHHMMErrors(ctx, 'release', releaseHour, releaseMinute, ['days', i])

      /* const previousDayIndex = i === 0 ? 6 : i - 1
      if (data.selectedDays?.includes(weekDays[previousDayIndex]!) && data.days[previousDayIndex]) {
        // If the previous day was filled out - we need to check that the previous day's overnight time is not after the current day's release time
        const previousDayOvernightHour = data.days[previousDayIndex]['returnHour']
        const previousDayOvernightMinute = data.days[previousDayIndex]['returnMinute']

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
      } */

      const isOvernight = day.isOvernight === 'true'

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

export type SchemaType = z.infer<typeof schema>
