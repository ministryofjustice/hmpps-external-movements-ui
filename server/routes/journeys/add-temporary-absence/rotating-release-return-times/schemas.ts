import z from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import {
  addBeforeErrors,
  addEmptyHHMMErrors,
  addInvalidHHMMErrors,
  parseHour,
  parseMinute,
} from '../../../../utils/validations/validateTime'

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

        addInvalidHHMMErrors('release', releaseHour, releaseMinute, [], ctx)
        addEmptyHHMMErrors('release', releaseHour, releaseMinute, [], ctx)

        addInvalidHHMMErrors('return', returnHour, returnMinute, [], ctx)
        addEmptyHHMMErrors('return', returnHour, returnMinute, [], ctx)

        if (item.type === 'Scheduled days' && releaseHour && releaseMinute && returnHour && returnMinute) {
          addBeforeErrors(releaseHour, releaseMinute, returnHour, returnMinute, [], ctx)
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
