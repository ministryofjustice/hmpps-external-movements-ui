import z from 'zod'
import { createSchema } from '../../../middleware/validation/validationMiddleware'

import { locationsSchema } from '../schema'

export const enterAreaSchema = createSchema({
  area: z.string().min(1, { message: 'Enter a description of the area' }),
  version: z.string(),
  locations: locationsSchema,
})

export type EnterAreaSchemaType = z.infer<typeof enterAreaSchema>
