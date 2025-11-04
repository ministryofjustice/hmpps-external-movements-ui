import { z } from 'zod'
import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../../services/apis/externalMovementsService'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'
import { validateAndTransformReferenceData } from '../../../../../utils/validations/validateReferenceData'
import { getUpdateAbsenceCategorisationsForDomain } from '../utils'

export const schemaFactory =
  (externalMovementsService: ExternalMovementsService) => async (req: Request, res: Response) => {
    const { absenceType, absenceSubType, reasonCategory, authorisation } = req.journeyData.updateTapAuthorisation!
    const ERR_MSG = (
      absenceType || absenceSubType || reasonCategory ? reasonCategory : authorisation.absenceReasonCategory
    )
      ? 'Select a type of work'
      : 'Select a reason for this absence'

    const refDataMap = new Map(
      (await getUpdateAbsenceCategorisationsForDomain(externalMovementsService, req, res, 'ABSENCE_REASON')).items.map(
        itm => [itm.code, itm],
      ),
    )

    return createSchema({
      reason: z.string({ error: ERR_MSG }).transform(validateAndTransformReferenceData(refDataMap, ERR_MSG)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
