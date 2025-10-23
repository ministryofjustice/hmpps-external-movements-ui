import z from 'zod'
import { createSchema } from '../../../middleware/validation/validationMiddleware'
import { validateTransformDate } from '../../../utils/validations/validateDatePicker'

export const schema = createSchema({
  date: validateTransformDate(() => true, '', '', ''),
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = SchemaType & { validated?: SchemaType }
