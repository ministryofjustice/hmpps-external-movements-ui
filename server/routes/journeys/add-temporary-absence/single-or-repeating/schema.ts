import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Select if this is a single or repeating absence'

export const schema = createSchema({
  repeat: z.enum(['SINGLE', 'REPEATING'], { message: ERROR_MSG }).transform(val => val === 'REPEATING'),
})

export type SchemaType = z.infer<typeof schema>
