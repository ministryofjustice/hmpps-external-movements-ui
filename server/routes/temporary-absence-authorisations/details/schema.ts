import z from 'zod'
import { createSchema } from '../../../middleware/validation/validationMiddleware'
import { validateTransformOptionalDate } from '../../../utils/validations/validateDatePicker'

export const schema = createSchema({
  dateFrom: validateTransformOptionalDate('Enter a valid start date from'),
  dateTo: validateTransformOptionalDate('Enter a valid end date to'),
}).check(ctx => {
  const { dateFrom, dateTo } = ctx.value
  if (dateFrom && dateTo && dateTo < dateFrom) {
    ctx.issues.push({ code: 'custom', message: 'Enter a valid date range', path: ['dateFrom'], input: ctx.value })
  }
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = SchemaType & { validated?: SchemaType }
