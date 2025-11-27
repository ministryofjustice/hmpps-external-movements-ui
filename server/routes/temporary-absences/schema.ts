import { z } from 'zod'
import { Request } from 'express'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateDateBase } from '../../utils/validations/validateDatePicker'

export const schemaFactory = async (_req: Request) => {
  return createSchema({
    searchTerm: z.string().optional(),
    status: z.enum(['', 'PENDING', 'SCHEDULED', 'CANCELLED', 'COMPLETED']),
    clear: z.string().optional(),
    fromDate: validateDateBase(`Enter from date`, `Enter a valid from date`),
    toDate: validateDateBase(`Enter to date`, `Enter a valid to date`),
    sort: z.string().optional(),
    page: z
      .string()
      .optional()
      .transform(val => {
        if (!val) return 1
        const num = Number(val)
        if (!Number.isNaN(num)) return num
        return 1
      }),
  })
}

type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
export type ResQuerySchemaType = (SchemaType & { validated?: SchemaType }) | undefined
