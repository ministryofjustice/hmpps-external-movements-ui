import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'The maximum character limit is 4000'

export const schema = createSchema({
  notes: z
    .string()
    .max(4000, { message: ERROR_MSG })
    .transform(val => (val.trim().length ? val : null)),
})

export type SchemaType = z.infer<typeof schema>
