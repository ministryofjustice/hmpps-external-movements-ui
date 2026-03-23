import { z } from 'zod'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateTransformOptionalDate } from '../../utils/validations/validateDatePicker'
import { TapOccurrenceStatusEnum } from '../temporary-absences/schema'

export const schema = createSchema({
  status: z.union([TapOccurrenceStatusEnum.transform(val => [val]), z.array(TapOccurrenceStatusEnum)]).optional(),
  clear: z.string().optional(),
  start: validateTransformOptionalDate('Enter or select a valid start date from'),
  end: validateTransformOptionalDate('Enter or select a valid end date to'),
  sort: z.string().optional(),
  type: z.string().optional(),
  subType: z.string().optional(),
  reason: z.string().optional(),
  workType: z.string().optional(),
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

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = SchemaType & { validated?: SchemaType }
