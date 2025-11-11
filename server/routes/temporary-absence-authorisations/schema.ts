import { z } from 'zod'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateDateBase } from '../../utils/validations/validateDatePicker'

export const schema = createSchema({
  searchTerm: z.string().optional(),
  status: z.enum(['', 'PENDING', 'APPROVED', 'DENIED', 'WITHDRAWN']),
  clear: z.string().optional(),
  fromDate: validateDateBase('Enter from date', 'Enter a valid from date'),
  toDate: validateDateBase('Enter to date', 'Enter a valid to date'),
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = (SchemaType & { validated?: SchemaType }) | undefined
