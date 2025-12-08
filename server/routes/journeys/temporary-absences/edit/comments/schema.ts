import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'

const CHAR_COUNT_ERROR_MSG = 'The maximum character limit is 4000'

export const schema = createSchema({
  notes: z
    .string()
    .max(4000, { message: CHAR_COUNT_ERROR_MSG })
    .default('')
    .transform(val => (val.trim().length ? val : val.trim())),
})

export type SchemaType = z.infer<typeof schema>
