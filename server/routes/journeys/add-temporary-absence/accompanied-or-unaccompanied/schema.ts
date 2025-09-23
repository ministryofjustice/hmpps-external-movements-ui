import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Select if the prisoner will be accompanied'

export const schema = createSchema({
  accompanied: z.enum(['YES', 'NO'], { message: ERROR_MSG }).transform(val => val === 'YES'),
})

export type SchemaType = z.infer<typeof schema>
