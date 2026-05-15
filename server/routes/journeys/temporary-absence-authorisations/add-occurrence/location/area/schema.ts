import z from 'zod'
import { createSchema } from '../../../../../../middleware/validation/validationMiddleware'

export const areaSchema = createSchema({
  area: z.string().min(1, { message: 'Enter a description of the area' }),
})

export type AreaSchemaType = z.infer<typeof areaSchema>
