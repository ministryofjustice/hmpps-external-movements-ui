import z from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { validateAndTransformReferenceData } from '../../../../utils/validations/validateReferenceData'

import ExternalMovementsService from '../../../../services/apis/externalMovementsService'

const LOCATION_TYPE_REQUIRED_MSG = 'Select a location type'

export const schemaFactory =
  (externalMovementsService: ExternalMovementsService) => async (_req: Request, res: Response) => {
    const locationTypeMap = new Map(
      (await externalMovementsService.getReferenceData({ res }, 'location-type')).map(itm => [itm.code, itm]),
    )
    return createSchema({
      locationType: z
        .string({ message: LOCATION_TYPE_REQUIRED_MSG })
        .transform(validateAndTransformReferenceData(locationTypeMap, LOCATION_TYPE_REQUIRED_MSG)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
