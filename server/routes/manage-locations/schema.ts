import z from 'zod'

export const locationsSchema = z.array(
  z.object({
    description: z
      .string()
      .optional()
      .transform(val => val ?? null),
    address: z
      .string()
      .optional()
      .transform(val => val ?? null),
    postcode: z
      .string()
      .optional()
      .transform(val => val ?? null),
    uprn: z
      .string()
      .optional()
      .transform(val => (val ? Number(val) : null)),
  }),
)
