import { z } from 'zod'
import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/externalMovementsApi/externalMovementsService'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { validateAndTransformReferenceData } from '../../../../utils/validations/validateReferenceData'

const ERR_MSG = 'Select the absence type'

export const schemaFactory =
  (externalMovementsService: ExternalMovementsService) => async (_req: Request, res: Response) => {
    const refDataMap = new Map(
      (await externalMovementsService.getAllAbsenceTypes({ res })).items.map(itm => [itm.code, itm]),
    )

    return createSchema({
      absenceType: z.string({ error: ERR_MSG }).transform(validateAndTransformReferenceData(refDataMap, ERR_MSG)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
