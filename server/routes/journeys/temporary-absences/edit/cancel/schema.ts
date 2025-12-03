import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  reason: z.string().refine(val => val.trim(), { message: 'Enter a reason' }),
})

export type SchemaType = z.infer<typeof schema>
