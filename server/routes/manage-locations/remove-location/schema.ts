import z from 'zod'
import { createSchema } from '../../../middleware/validation/validationMiddleware'

import { locationsSchema } from '../schema'

export const removeLocationSchema = createSchema({
  remove: z.string().transform(val => {
    const number = Number(val)
    if (Number.isNaN(number)) return null
    return number
  }),
  version: z.string(),
  locations: locationsSchema,
})

export type RemoveLocationSchemaType = z.infer<typeof removeLocationSchema>
