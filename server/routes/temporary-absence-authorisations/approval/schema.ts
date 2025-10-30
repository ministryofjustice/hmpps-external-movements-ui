import { z } from 'zod'
import { createSchema } from '../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  approve: z
    .enum(['YES', 'NO'], { message: 'Select whether to approve or reject the absence' })
    .transform(val => val === 'YES'),
  approveReason: z.string().optional(),
  rejectReason: z.string().optional(),
}).transform(({ approve, approveReason, rejectReason }, ctx) => {
  if (!approve && !rejectReason?.trim().length) {
    ctx.addIssue({
      code: 'custom',
      path: ['rejectReason'],
      message: 'Enter a reject reason',
    })
    return z.NEVER
  }

  return {
    approve,
    approveReason: approve && approveReason?.trim() ? approveReason : null,
    rejectReason: !approve && rejectReason?.trim() ? rejectReason : null,
  }
})

export type SchemaType = z.infer<typeof schema>
