import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'
import { optionalString } from '../../../../../utils/validations/validateString'

export const schema = createSchema({
  description: optionalString,
  line1: optionalString,
  line2: optionalString,
  city: z.string().min(1, { message: 'Enter town or city' }),
  county: optionalString,
  postcode: optionalString,
})

export type SchemaType = z.infer<typeof schema>
