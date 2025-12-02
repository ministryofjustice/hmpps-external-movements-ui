import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  approve: z
    .enum(['YES', 'NO'], { message: 'Select if you want to approve this absence' })
    .transform(val => val === 'YES'),
})

export type SchemaType = z.infer<typeof schema>
