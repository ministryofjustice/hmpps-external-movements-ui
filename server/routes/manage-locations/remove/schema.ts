import z from 'zod'
import { createSchema } from '../../../middleware/validation/validationMiddleware'
import { locationsSchema } from '../schema'

const ERROR_MSG = 'Select yes if you want to remove this saved location'

export const schema = createSchema({
  confirm: z.enum(['YES', 'NO'], { message: ERROR_MSG }).transform(val => val === 'YES'),
  remove: z.string().transform(val => Number(val)),
  version: z.string(),
  locations: locationsSchema,
})

export type SchemaType = z.infer<typeof schema>
