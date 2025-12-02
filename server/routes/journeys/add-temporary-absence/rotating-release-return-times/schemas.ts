import z from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import {
  addBeforeErrors,
  addEmptyHHMMErrors,
  addInvalidHHMMErrors,
  parseHour,
  parseMinute,
} from '../../../../utils/validations/validateTime'

const ERROR_BEFORE_RELEASE = 'The return time must come after the start time'

export const schema = createSchema({
  times: z.array(
    z
      .object({
        type: z.string(),
        releaseHour: z.string(),
        releaseMinute: z.string(),
        returnHour: z.string(),
        returnMinute: z.string(),
      })
      .transform((item, ctx) => {
        const releaseHour = item.releaseHour ? parseHour(item.releaseHour) : undefined
        const releaseMinute = item.releaseMinute ? parseMinute(item.releaseMinute) : undefined
        const returnHour = item.returnHour ? parseHour(item.returnHour) : undefined
        const returnMinute = item.returnMinute ? parseMinute(item.returnMinute) : undefined

        addInvalidHHMMErrors(ctx, 'release', releaseHour, releaseMinute)
        addEmptyHHMMErrors(ctx, 'release', releaseHour, releaseMinute)

        addInvalidHHMMErrors(ctx, 'return', returnHour, returnMinute)
        addEmptyHHMMErrors(ctx, 'return', returnHour, returnMinute)

        if (item.type === 'Scheduled days' && releaseHour && releaseMinute && returnHour && returnMinute) {
          addBeforeErrors(ctx, releaseHour, releaseMinute, returnHour, returnMinute, [], ERROR_BEFORE_RELEASE)
        }

        return {
          type: item.type,
          releaseTime: `${releaseHour?.data}:${releaseMinute?.data}`,
          returnTime: `${returnHour?.data}:${returnMinute?.data}`,
        }
      }),
  ),
})

export type SchemaType = z.infer<typeof schema>
