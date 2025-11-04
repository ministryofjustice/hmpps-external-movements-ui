import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  locations: z.array(
    z.string().transform((val, ctx) => {
      const locationIdx = val ? Number(val) : null
      if (locationIdx === null || Number.isNaN(locationIdx)) {
        ctx.addIssue({ code: 'custom', message: 'Select a location' })
        return z.NEVER
      }
      return locationIdx
    }),
  ),
})

export type SchemaType = z.infer<typeof schema>
