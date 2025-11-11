import { z } from 'zod'
import { Request } from 'express'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateDateBase } from '../../utils/validations/validateDatePicker'

export const schemaFactory = async (_req: Request) => {
  return createSchema({
    searchTerm: z.string().optional(),
    direction: z.enum(['OUT', 'IN']),
    status: z.enum(['', 'PENDING', 'SCHEDULED', 'CANCELLED', 'COMPLETED']),
    clear: z.string().optional(),
    fromDate: validateDateBase(`Enter from date`, `Enter a valid from date`),
    toDate: validateDateBase(`Enter to date`, `Enter a valid to date`),
  })
}

type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
export type ResQuerySchemaType = (SchemaType & { validated?: SchemaType }) | undefined
