import z from 'zod'
import { createSchema } from '../../../middleware/validation/validationMiddleware'

import { locationsSchema } from '../schema'

export const sortOrRemoveLocationSchema = createSchema({
  remove: z
    .string()
    .optional()
    .transform(val => {
      const number = Number(val)
      if (Number.isNaN(number)) return null
      return number
    }),
  version: z.string(),
  locations: locationsSchema,
  order: z.union([z.string().transform(val => [Number(val)]), z.array(z.string().transform(val => Number(val)))]),
})

export type SortOrRemoveLocationSchemaType = z.infer<typeof sortOrRemoveLocationSchema>
