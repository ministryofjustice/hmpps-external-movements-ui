import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import { getAuthorisationAndPopulatePrisonerDetails } from '../utils'
import { ResQuerySchemaType } from './schema'
import { getApiUserErrorMessage } from '../../../utils/utils'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'

export class TapAuthorisationDetailsController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { dateFrom, dateTo, validated } = (res.locals['query'] ?? {}) as ResQuerySchemaType

      const authorisation = await getAuthorisationAndPopulatePrisonerDetails(
        this.externalMovementsService,
        req,
        res,
        validated?.dateFrom,
        validated?.dateTo,
      )

      res.render('temporary-absence-authorisations/details/view', {
        showBreadcrumbs: true,
        result: authorisation,
        dateFrom,
        dateTo,
      })
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
      res.notFound()
    }
  }
}
