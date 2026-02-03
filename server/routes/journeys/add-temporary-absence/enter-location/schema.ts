import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { optionalString } from '../../../../utils/validations/validateString'

export const enterLocationSchema = createSchema({
  description: z
    .string()
    .max(40, { message: 'Description must be 40 characters or fewer' })
    .transform(val => (val?.trim().length ? val : null)),
  line1: optionalString,
  line2: optionalString,
  city: z.string().min(1, { message: 'Enter town or city' }),
  county: optionalString,
  postcode: optionalString,
})

export type EnterLocationSchemaType = z.infer<typeof enterLocationSchema>
