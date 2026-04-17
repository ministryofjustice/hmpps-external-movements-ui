import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  resume: z
    .enum(['YES', 'NO'], { message: 'Select if you want to resume this absence' })
    .transform(val => val === 'YES'),
})

export type SchemaType = z.infer<typeof schema>
