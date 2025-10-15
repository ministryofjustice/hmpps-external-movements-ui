import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

const COUNTRY_REQUIRED_MESSAGE = 'Select a country'

export const schema = createSchema({
  flat: z
    .string()
    .optional()
    .transform(val => (val?.trim()?.length ? val?.trim() : null)),
  property: z
    .string()
    .optional()
    .transform(val => (val?.trim()?.length ? val?.trim() : null)),
  street: z
    .string()
    .optional()
    .transform(val => (val?.trim()?.length ? val?.trim() : null)),
  area: z
    .string()
    .optional()
    .transform(val => (val?.trim()?.length ? val?.trim() : null)),
  cityText: z
    .string()
    .optional()
    .transform(val => (val?.trim()?.length ? val?.trim() : null)),
  countyText: z
    .string()
    .optional()
    .transform(val => (val?.trim()?.length ? val?.trim() : null)),
  postcode: z
    .string()
    .optional()
    .transform(val => (val?.trim()?.length ? val?.trim() : null)),
  countryText: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  country: z.string().optional(),
}).transform(({ countryText, ...others }, ctx) => {
  const country = countryText?.trim()
  if (country?.length) {
    return {
      countryText: country,
      ...others,
    }
  }
  ctx.addIssue({
    code: 'custom',
    message: COUNTRY_REQUIRED_MESSAGE,
    path: ['country'],
  })
  return z.NEVER
})

export type SchemaType = z.infer<typeof schema>
