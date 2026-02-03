import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Enter 4000 or fewer characters'

export const schema = createSchema({
  comments: z
    .string()
    .max(4000, { message: ERROR_MSG })
    .transform(val => (val.trim().length ? null : null)),
})

export type SchemaType = z.infer<typeof schema>
