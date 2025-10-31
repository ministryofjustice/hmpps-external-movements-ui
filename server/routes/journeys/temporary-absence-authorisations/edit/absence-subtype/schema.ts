import { z } from 'zod'
import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'
import { validateAndTransformReferenceData } from '../../../../../utils/validations/validateReferenceData'
import { formatRefDataName } from '../../../../../utils/formatUtils'
import { getUpdateAbsenceCategorisationsForDomain } from '../utils'

export const schemaFactory =
  (externalMovementsService: ExternalMovementsService) => async (req: Request, res: Response) => {
    const absenceType =
      req.journeyData.updateTapAuthorisation!.absenceType ??
      req.journeyData.updateTapAuthorisation!.authorisation.absenceType
    const ERR_MSG = `Select the ${formatRefDataName(absenceType!.description)} type`

    const refDataMap = new Map(
      (
        await getUpdateAbsenceCategorisationsForDomain(externalMovementsService, req, res, 'ABSENCE_SUB_TYPE')
      ).items.map(itm => [itm.code, itm]),
    )

    return createSchema({
      absenceSubType: z.string({ error: ERR_MSG }).transform(validateAndTransformReferenceData(refDataMap, ERR_MSG)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
