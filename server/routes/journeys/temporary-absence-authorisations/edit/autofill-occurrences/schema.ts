import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  confirm: z.enum(['YES', 'NO'], { message: 'Select if you want to change the dates' }).transform(val => val === 'YES'),
})

export type SchemaType = z.infer<typeof schema>
