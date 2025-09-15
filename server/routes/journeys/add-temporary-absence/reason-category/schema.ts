import { z } from 'zod'
import { Request, Response } from 'express'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { validateAndTransformReferenceData } from '../../../../utils/validations/validateReferenceData'
import { getAbsenceCategorisationsForDomain } from '../../../common/utils'

const ERR_MSG = `Select a reason for this absence`

export const schemaFactory =
  (externalMovementsService: ExternalMovementsService) => async (req: Request, res: Response) => {
    const refDataMap = new Map(
      (
        await getAbsenceCategorisationsForDomain(externalMovementsService, req, res, 'ABSENCE_REASON_CATEGORY')
      ).items.map(itm => [itm.code, itm]),
    )

    return createSchema({
      reasonCategory: z.string({ error: ERR_MSG }).transform(validateAndTransformReferenceData(refDataMap, ERR_MSG)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
