import z from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  add: z.any().optional(),
  save: z.any().optional(),
  remove: z.any().optional(),
  items: z.array(
    z.object({
      count: z.string().optional(),
      type: z.string().optional(),
    }),
  ),
}).transform((val, ctx) => {
  if (val.items[val.items.length - 1]?.type !== 'Rest days') {
    ctx.addIssue({
      code: 'custom',
      message: 'Add rest days to the end of the schedule',
      path: ['add'],
    })
  } else if (val.items.length === 1) {
    ctx.addIssue({
      code: 'custom',
      message: 'Add at least two rows to the schedule',
      path: ['add'],
    })
  }

  return {
    ...val,
    items: val.items.map((item, i) => {
      const number = Number(item.count)
      if (!number || number < 1) {
        ctx.addIssue({
          code: 'custom',
          message: `Enter a ${(item.count?.length || 0) > 0 ? 'valid ' : ''}number`,
          path: ['items', i, 'count'],
        })
      }

      if (!['Scheduled days', 'Rest days', 'Scheduled nights'].includes(item.type!)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Select the type of working pattern',
          path: ['items', i, 'type'],
        })
      }
      return {
        count: Number(item.count),
        type: item.type!,
      }
    }),
  }
})

export type SchemaType = z.infer<typeof schema>
