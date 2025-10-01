import { z } from 'zod'
import { Request } from 'express'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateDateBase } from '../../utils/validations/validateDatePicker'

export const schemaFactory = async (req: Request) => {
  const dateType = req.query['direction'] === 'IN' ? 'return date' : 'release date'

  return createSchema({
    searchTerm: z.string().optional(),
    direction: z.enum(['OUT', 'IN']),
    status: z.enum(['', 'PENDING', 'SCHEDULED', 'CANCELLED', 'COMPLETED']),
    clear: z.string().optional(),
    fromDate: validateDateBase(`Enter the earliest ${dateType}`, `Enter a valid earliest ${dateType}`),
    toDate: validateDateBase(`Enter the latest ${dateType}`, `Enter a valid latest ${dateType}`),
  })
}

type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
export type ResQuerySchemaType = (SchemaType & { validated?: SchemaType }) | undefined
