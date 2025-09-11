import { z } from 'zod'
import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { validateAndTransformReferenceData } from '../../../../utils/validations/validateReferenceData'
import { getAbsenceCategorisationsForDomain, getAbsenceCategoryBackUrl } from '../../../common/utils'

export const schemaFactory =
  (externalMovementsService: ExternalMovementsService) => async (req: Request, res: Response) => {
    const ERR_MSG =
      getAbsenceCategoryBackUrl(req, 'ABSENCE_REASON') === 'reason-category'
        ? 'Select a type of work'
        : 'Select a reason for this absence'

    const refDataMap = new Map(
      (await getAbsenceCategorisationsForDomain(externalMovementsService, req, res, 'ABSENCE_REASON')).items.map(
        itm => [itm.code, itm],
      ),
    )

    return createSchema({
      reason: z.string({ error: ERR_MSG }).transform(validateAndTransformReferenceData(refDataMap, ERR_MSG)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
