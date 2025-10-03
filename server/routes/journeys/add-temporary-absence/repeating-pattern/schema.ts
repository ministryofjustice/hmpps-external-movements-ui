import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Select if the absences will take place in a repeating pattern'

export const schema = createSchema({
  patternType: z.enum(['FREEFORM', 'WEEKLY', 'ROTATING'], { message: ERROR_MSG }),
})

export type SchemaType = z.infer<typeof schema>
