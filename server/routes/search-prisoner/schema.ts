import { z } from 'zod'
import { createSchema } from '../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  searchTerm: z.string().refine(val => val.trim(), { message: 'Enter a name or prison number' }),
})

export type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = SchemaType & { validated?: SchemaType }
