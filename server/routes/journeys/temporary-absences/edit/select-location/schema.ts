import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Select a location where this occurrence will take place'

export const schema = createSchema({
  locationOption: z.string({ message: ERROR_MSG }).transform((val, ctx) => {
    if (val === 'NEW') {
      return val
    }

    const number = Number(val)

    if (val && !Number.isNaN(number)) {
      return number
    }

    ctx.addIssue({ code: 'custom', message: ERROR_MSG })
    return z.NEVER
  }),
})

export type SchemaType = z.infer<typeof schema>
