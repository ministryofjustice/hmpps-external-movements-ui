import { z } from 'zod'
import { createSchema } from '../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  template: z.string().min(1, { message: 'Select a document type' }),
})

export type SchemaType = z.infer<typeof schema>
