import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const ERROR_MSG = 'Enter an address or postcode'

export const schema = createSchema({
  locationSearch: z.string({ message: ERROR_MSG }).min(1, { message: ERROR_MSG }),
})

export type SchemaType = z.infer<typeof schema>
