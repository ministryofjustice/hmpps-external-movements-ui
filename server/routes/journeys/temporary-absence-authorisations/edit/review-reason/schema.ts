import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  reason: z.string().transform(val => (val.trim().length ? val : null)),
})

export type SchemaType = z.infer<typeof schema>
