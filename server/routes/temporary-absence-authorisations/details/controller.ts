import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import ExternalMovementsService from '../../../services/apis/externalMovementsService'
import { components } from '../../../@types/externalMovements'
import { getApiUserErrorMessage } from '../../../utils/utils'
import { ResQuerySchemaType } from './schema'

export class TapAuthorisationDetailsController {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    let result: components['schemas']['TapAuthorisation'] | null = null
    const { date, validated } = res.locals['query'] as ResQuerySchemaType
    try {
      result = await this.externalMovementsService.getTapAuthorisation({ res }, req.params.id)
      res.locals.prisonerDetails = {
        prisonerNumber: result.person.personIdentifier,
        lastName: result.person.lastName,
        firstName: result.person.firstName,
        dateOfBirth: result.person.dateOfBirth,
        prisonName: res.locals.user.activeCaseLoad?.description,
        cellLocation: result.person.cellLocation,
      }
      if (validated) {
        result.occurrences = result.occurrences.filter(({ releaseAt }) => releaseAt.startsWith(validated.date))
      }
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    res.render('temporary-absence-authorisations/details/view', {
      showBreadcrumbs: true,
      result,
      date,
    })
  }
}
