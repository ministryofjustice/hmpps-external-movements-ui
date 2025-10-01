import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'
import { components } from '../../../@types/externalMovements'
import { getApiUserErrorMessage } from '../../../utils/utils'

export class TapOccurrenceDetailsController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    let result: components['schemas']['TapOccurrence'] | null = null
    try {
      result = await this.externalMovementsService.getTapOccurrence({ res }, req.params.id)
      res.locals.prisonerDetails = {
        prisonerNumber: result.authorisation.person.personIdentifier,
        lastName: result.authorisation.person.lastName,
        firstName: result.authorisation.person.firstName,
        dateOfBirth: result.authorisation.person.dateOfBirth,
        prisonName: res.locals.user.activeCaseLoad?.description,
        cellLocation: result.authorisation.person.cellLocation,
      }
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    return res.render('temporary-absences/details/view', {
      showBreadcrumbs: true,
      result,
    })
  }
}
