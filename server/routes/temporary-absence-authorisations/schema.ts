import { z } from 'zod'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateDateBase } from '../../utils/validations/validateDatePicker'

export const schema = createSchema({
  searchTerm: z.string().optional(),
  status: z.enum(['', 'PENDING', 'APPROVED', 'DENIED', 'WITHDRAWN']),
  clear: z.string().optional(),
  fromDate: validateDateBase('Enter the earliest release date', 'Enter a valid earliest release date'),
  toDate: validateDateBase('Enter the latest return date', 'Enter a valid latest return date'),
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = (SchemaType & { validated?: SchemaType }) | undefined
