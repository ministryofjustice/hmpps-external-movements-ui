import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Select if this absence needs to be approved'

export const schema = createSchema({
  requireApproval: z.enum(['YES', 'NO'], { message: ERROR_MSG }).transform(val => val === 'YES'),
})

export type SchemaType = z.infer<typeof schema>
