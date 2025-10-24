import z from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  sameTimes: z.enum(['Yes', 'No'], { message: 'Select if the scheduled days or nights take place at the same times' }),
}).transform(val => {
  return {
    isSameTime: val.sameTimes === 'Yes',
  }
})

export type SchemaType = z.infer<typeof schema>
