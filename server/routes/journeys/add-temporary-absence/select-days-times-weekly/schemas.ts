import z from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { parseHour, parseMinute } from '../../../../utils/validations/validateTime'
import { AddTemporaryAbsenceJourney } from '../../../../@types/journeys'

const ERROR_NO_DAYS = 'Select at least one day'

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const schema = createSchema({
  days: z.optional(z.union([z.string().array().min(1, { message: ERROR_NO_DAYS }), z.enum(weekDays)])),
  ...addOptions('monday'),
  ...addOptions('tuesday'),
  ...addOptions('wednesday'),
  ...addOptions('thursday'),
  ...addOptions('friday'),
  ...addOptions('saturday'),
  ...addOptions('sunday'),
}).transform((obj, ctx) => {
  if (!obj.days) {
    ctx.addIssue({
      code: 'custom',
      message: ERROR_NO_DAYS,
      path: ['days'],
    })
  }
  return [
    transformForDay('monday', '', obj as never, ctx),
    transformForDay('tuesday', 'monday', obj as never, ctx),
    transformForDay('wednesday', 'tuesday', obj as never, ctx),
    transformForDay('thursday', 'wednesday', obj as never, ctx),
    transformForDay('friday', 'thursday', obj as never, ctx),
    transformForDay('saturday', 'friday', obj as never, ctx),
    transformForDay('sunday', 'saturday', obj as never, ctx),
  ].filter(o => o?.day) as Required<AddTemporaryAbsenceJourney>['weeklyPattern']
})

function transformForDay(day: string, previousDay: string, data: never, ctx: z.core.$RefinementCtx) {
  if (!(data['days'] as Array<string>)?.includes(day)) {
    return undefined
  }

  const keyReleaseHour = `${day}ReleaseHour`
  const keyReleaseMinute = `${day}ReleaseMinute`
  const keyReturnHour = `${day}ReturnHour`
  const keyReturnMinute = `${day}ReturnMinute`
  const keyOvernightHour = `${day}OvernightHour`
  const keyOvernightMinute = `${day}OvernightMinute`
  const keyIsOvernight = `${day}IsOvernight`

  const parsedStartHour = (data[keyReleaseHour] as string)?.length ? parseHour(data[keyReleaseHour]) : undefined
  const parsedStartMinute = (data[keyReleaseMinute] as string)?.length ? parseMinute(data[keyReleaseMinute]) : undefined

  const parsedEndHour = (data[keyReturnHour] as string)?.length ? parseHour(data[keyReturnHour]) : undefined
  const parsedEndMinute = (data[keyReturnMinute] as string)?.length ? parseMinute(data[keyReturnMinute]) : undefined

  const parsedOvernightHour = (data[keyOvernightHour] as string)?.length ? parseHour(data[keyOvernightHour]) : undefined
  const parsedOvernightMinute = (data[keyOvernightMinute] as string)?.length
    ? parseMinute(data[keyOvernightMinute])
    : undefined

  addInvalidHHMMErrors(day, 'Release', parsedStartHour, parsedStartMinute, ctx)
  addEmptyHHMMErrors(day, 'Release', parsedStartHour, parsedStartMinute, ctx)

  if ((data['days'] as Array<string>)?.includes(previousDay)) {
    // If the previous day was filled out - we need to check that the previous day's overnight time is not after the current day's release time
    validatePreviousDayOvernightOverlap(day, previousDay, data, ctx)
  }

  if (data[keyIsOvernight] !== 'true') {
    addInvalidHHMMErrors(day, 'Return', parsedEndHour, parsedEndMinute, ctx)
    addEmptyHHMMErrors(day, 'Return', parsedEndHour, parsedEndMinute, ctx)

    if (parsedStartHour && parsedStartMinute && parsedEndHour && parsedEndMinute) {
      addBeforeErrors(day, parsedStartHour!, parsedStartMinute!, parsedEndHour!, parsedEndMinute!, ctx)
    }
  } else {
    addInvalidHHMMErrors(day, 'Overnight', parsedOvernightHour, parsedOvernightMinute, ctx)
    addEmptyHHMMErrors(day, 'Overnight', parsedOvernightHour, parsedOvernightMinute, ctx)
  }

  return {
    day,
    overnight: data[keyIsOvernight] === 'true',
    startTime: `${parsedStartHour?.data}:${parsedStartMinute?.data}`,
    returnTime:
      data[keyIsOvernight] === 'true'
        ? `${parsedOvernightHour?.data}:${parsedOvernightMinute?.data}`
        : `${parsedEndHour?.data}:${parsedEndMinute?.data}`,
  } as Required<AddTemporaryAbsenceJourney>['weeklyPattern']['0']
}

function validatePreviousDayOvernightOverlap(
  day: string,
  previousDay: string,
  data: never,
  ctx: z.core.$RefinementCtx,
) {
  const previousDayOvernightHour = data[`${previousDay}OvernightHour`]
  const previousDayOvernightMinute = data[`${previousDay}OvernightMinute`]

  const dayReleaseHour = data[`${day}ReleaseHour`]
  const dayReleaseMinute = data[`${day}ReleaseMinute`]

  if (previousDayOvernightHour && previousDayOvernightMinute && dayReleaseHour && dayReleaseMinute) {
    const previousDayReleaseTime = Number(previousDayOvernightHour) * 60 + Number(previousDayOvernightMinute)
    const dayReleaseTime = Number(dayReleaseHour) * 60 + Number(dayReleaseMinute)

    if (previousDayReleaseTime > dayReleaseTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'The release time must be later than the overnight return time',
        path: [`${day}ReleaseHour`],
      })
      ctx.addIssue({
        code: 'custom',
        message: '',
        path: [`${day}ReleaseMinute`],
      })
    }
  }
}

function addEmptyHHMMErrors(
  day: string,
  segment: 'Release' | 'Return' | 'Overnight',
  parsedHour: z.ZodSafeParseResult<string> | undefined,
  parsedMinute: z.ZodSafeParseResult<string> | undefined,
  ctx: z.core.$RefinementCtx,
) {
  const errorMessage = `Enter a${segment[0] === 'O' ? 'n' : ''} ${segment.toLocaleLowerCase()} time`
  if (!parsedHour && !parsedMinute) {
    ctx.addIssue({
      code: 'custom',
      message: errorMessage,
      path: [`${day}${segment}Hour`],
    })

    ctx.addIssue({
      code: 'custom',
      message: '',
      path: [`${day}${segment}Minute`],
    })
  } else if (!parsedHour) {
    ctx.addIssue({
      code: 'custom',
      message: errorMessage,
      path: [`${day}${segment}Hour`],
    })
  } else if (!parsedMinute) {
    ctx.addIssue({
      code: 'custom',
      message: '',
      path: [`${day}${segment}Minute`],
    })
  }
}

function addBeforeErrors(
  day: string,
  parsedStartHour: z.ZodSafeParseResult<string>,
  parsedStartMinute: z.ZodSafeParseResult<string>,
  parsedEndHour: z.ZodSafeParseResult<string>,
  parsedEndMinute: z.ZodSafeParseResult<string>,
  ctx: z.core.$RefinementCtx,
) {
  const startTime = Number(parsedStartHour!.data) * 60 + Number(parsedStartMinute!.data)
  const endTime = Number(parsedEndHour!.data) * 60 + Number(parsedEndMinute!.data)

  if (endTime < startTime) {
    ctx.addIssue({
      code: 'custom',
      message: 'The return time must come after the release date and time',
      path: [`${day}ReturnHour`],
    })
  }
}

function addInvalidHHMMErrors(
  day: string,
  segment: 'Release' | 'Return' | 'Overnight',
  parsedHour: z.ZodSafeParseResult<string> | undefined,
  parsedMinute: z.ZodSafeParseResult<string> | undefined,
  ctx: z.core.$RefinementCtx,
) {
  const error = `Enter a valid ${segment.toLowerCase()} time`
  if (parsedHour?.error && parsedMinute?.error) {
    ctx.addIssue({
      code: 'custom',
      message: error,
      path: [`${day}${segment}Hour`],
    })
    ctx.addIssue({
      code: 'custom',
      message: '',
      path: [`${day}${segment}Minute`],
    })
  } else if (parsedHour?.error) {
    ctx.addIssue({
      code: 'custom',
      message: error,
      path: [`${day}${segment}Hour`],
    })
  } else if (parsedMinute?.error) {
    ctx.addIssue({
      code: 'custom',
      message: error,
      path: [`${day}${segment}Minute`],
    })
  }
}

function addOptions(day: string) {
  return {
    [`${day}ReleaseHour`]: z.string().optional(),
    [`${day}ReleaseMinute`]: z.string().optional(),
    [`${day}ReturnHour`]: z.string().optional(),
    [`${day}ReturnMinute`]: z.string().optional(),
    [`${day}OvernightHour`]: z.string().optional(),
    [`${day}OvernightMinute`]: z.string().optional(),
    [`${day}IsOvernight`]: z.string().optional(),
  }
}

export type SchemaType = z.infer<typeof schema>
