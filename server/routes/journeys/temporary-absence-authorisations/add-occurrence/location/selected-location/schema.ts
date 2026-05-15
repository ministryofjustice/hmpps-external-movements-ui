import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../../../middleware/validation/validationMiddleware'

export const selectedLocationSchema = async (req: Request, _res: Response) =>
  createSchema({
    location: z.string().transform((val, ctx) => {
      const number = Number(val)
      if (Number.isNaN(number)) {
        ctx.addIssue({ code: 'custom', message: 'Select a location' })
        return z.NEVER
      }
      return req.journeyData.addTapOccurrence!.savedLocations![number]!
    }),
  })

export type SelectedLocationSchemaType = z.infer<Awaited<ReturnType<typeof selectedLocationSchema>>>
