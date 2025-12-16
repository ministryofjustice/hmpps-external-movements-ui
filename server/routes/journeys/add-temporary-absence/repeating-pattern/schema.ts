import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Select how the occurrences of this absence will repeat'

export const schema = createSchema({
  patternType: z.enum(['FREEFORM', 'WEEKLY', 'ROTATING', 'SHIFT', 'BIWEEKLY'], { message: ERROR_MSG }),
})

export type SchemaType = z.infer<typeof schema>
