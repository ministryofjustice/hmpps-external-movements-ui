import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { validateAndTransformReferenceData } from '../../../../utils/validations/validateReferenceData'

import ExternalMovementsService from '../../../../services/apis/externalMovementsService'

const ACCOMPANIED_BY_REQUIRED_MSG = 'Select who will accompany the prisoner'

export const schemaFactory =
  (externalMovementsService: ExternalMovementsService) => async (_req: Request, res: Response) => {
    const accompaniedByMap = new Map(
      (await externalMovementsService.getReferenceData({ res }, 'accompanied-by')).map(itm => [itm.code, itm]),
    )
    return createSchema({
      accompaniedBy: z
        .string({ message: ACCOMPANIED_BY_REQUIRED_MSG })
        .transform(validateAndTransformReferenceData(accompaniedByMap, ACCOMPANIED_BY_REQUIRED_MSG)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
