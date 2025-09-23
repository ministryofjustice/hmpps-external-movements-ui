import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { validateAndTransformReferenceData } from '../../../../utils/validations/validateReferenceData'

import ExternalMovementsService from '../../../../services/apis/externalMovementsService'

const REQUIRED_MSG = 'Select a transport option'

export const schemaFactory =
  (externalMovementsService: ExternalMovementsService) => async (_req: Request, res: Response) => {
    const refDataMap = new Map(
      (await externalMovementsService.getReferenceData({ res }, 'transport')).map(itm => [itm.code, itm]),
    )
    return createSchema({
      transport: z
        .string({ message: REQUIRED_MSG })
        .transform(validateAndTransformReferenceData(refDataMap, REQUIRED_MSG)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
