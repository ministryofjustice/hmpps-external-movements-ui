import z from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { parseHour, parseMinute } from '../../../../utils/validations/validateTime'

export const schema = createSchema({
  add: z.any().optional(),
  save: z.any().optional(),
  remove: z.any().optional(),
  items: z.array(
    z
      .object({
        count: z.string(),
        type: z.string(),
        startTimeHour: z.string(),
        startTimeMinute: z.string(),
        returnTimeHour: z.string(),
        returnTimeMinute: z.string(),
      })
      .transform(({ type, count, startTimeHour, startTimeMinute, returnTimeHour, returnTimeMinute }, ctx) => {
        const parsedType = ['DAY', 'NIGHT', 'REST'].includes(type) ? type : undefined
        if (!parsedType) {
          ctx.addIssue({
            code: 'custom',
            message: 'Select the type of working pattern',
            path: ['type'],
          })
        }

        const number = Number(count)
        const parsedCount = !count || Number.isNaN(number) || number < 1 ? undefined : number
        if (!parsedCount) {
          ctx.addIssue({
            code: 'custom',
            message: `Enter a valid number`,
            path: ['count'],
          })
        }

        if (parsedType === 'REST') {
          if (parsedCount)
            return {
              type: parsedType as 'REST',
              count: parsedCount,
            }

          return z.NEVER
        }

        const parsedStartHour = startTimeHour?.length ? parseHour(startTimeHour) : undefined
        const parsedStartMinute = startTimeMinute?.length ? parseMinute(startTimeMinute) : undefined

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

        if (parsedStartHour?.error) {
          ctx.addIssue({
            code: 'custom',
            message: 'Start time hour must be 00 to 23',
            path: ['startTimeHour'],
          })
        }
        if (parsedStartMinute?.error) {
          ctx.addIssue({
            code: 'custom',
            message: 'Start time minute must be 00 to 59',
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

        if (
          parsedStartHour?.success &&
          parsedStartMinute?.success &&
          parsedReturnHour?.success &&
          parsedReturnMinute?.success
        ) {
          if (
            type === 'DAY' &&
            `${parsedReturnHour.data}:${parsedReturnMinute.data}` <= `${parsedStartHour.data}:${parsedStartMinute.data}`
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'Return time must be later than start time for scheduled days',
              path: ['returnTimeHour'],
            })
            // empty error message to highlight both input fields with error
            ctx.addIssue({ code: 'custom', message: '', path: ['returnTime'] })
            return z.NEVER
          }

          if (parsedType && parsedCount) {
            return {
              type: parsedType as 'DAY' | 'NIGHT',
              count: parsedCount,
              startTimeHour: parsedStartHour.data,
              startTimeMinute: parsedStartMinute.data,
              returnTimeHour: parsedReturnHour.data,
              returnTimeMinute: parsedReturnMinute.data,
            }
          }
        }

        return z.NEVER
      }),
  ),
}).superRefine((val, ctx) => {
  if (val.items[val.items.length - 1]?.type !== 'REST') {
    ctx.addIssue({
      code: 'custom',
      message: 'Add rest days to the end of the schedule',
      path: ['add'],
    })
  } else if (val.items.length === 1) {
    ctx.addIssue({
      code: 'custom',
      message: 'Add at least two rows to the schedule',
      path: ['add'],
    })
  }
})

export type SchemaType = z.infer<typeof schema>
