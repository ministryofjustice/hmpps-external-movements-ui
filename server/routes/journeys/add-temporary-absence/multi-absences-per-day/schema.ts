import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const IS_MULTI_ERROR = 'Select if the prisoner will have multiple absences in the same day'
const ABSENCES_PER_DAY_ERROR = 'Enter the number of absences each day (enter between 2 and 10)'

export const schema = createSchema({
  isMulti: z.enum(['YES', 'NO'], { message: IS_MULTI_ERROR }),
  absencesPerDay: z.string().optional(),
}).transform(({ isMulti, absencesPerDay }, ctx) => {
  if (isMulti === 'YES') {
    const day = absencesPerDay ? Number(absencesPerDay.trim()) : 0

    if (Number.isNaN(day) || day < 2 || day > 10) {
      ctx.addIssue({ code: 'custom', message: ABSENCES_PER_DAY_ERROR, path: ['absencesPerDay'] })
      return z.NEVER
    }

    return { absencesPerDay: day }
  }

  return { absencesPerDay: 1 }
})

export type SchemaType = z.infer<typeof schema>
