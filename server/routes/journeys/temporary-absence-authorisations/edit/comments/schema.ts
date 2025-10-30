import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'

const REQUIRED_ERROR_MSG = 'Enter comments on this temporary absence'
const CHAR_COUNT_ERROR_MSG = 'The maximum character limit is 4000'

export const schema = createSchema({
  notes: z
    .string({ message: REQUIRED_ERROR_MSG })
    .max(4000, { message: CHAR_COUNT_ERROR_MSG })
    .transform((val, ctx) => {
      const res = val.trim()
      if (res.length) return res

      ctx.addIssue({
        code: 'custom',
        message: REQUIRED_ERROR_MSG,
      })

      return z.NEVER
    }),
})

export type SchemaType = z.infer<typeof schema>
