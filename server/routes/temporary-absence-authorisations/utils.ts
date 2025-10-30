import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import { components } from '../../@types/externalMovements'
import { getApiUserErrorMessage } from '../../utils/utils'

const getAuthorisationAndPopulatePrisonerDetails = async (
  externalMovementsService: ExternalMovementsService,
  req: Request<{ id: string }>,
  res: Response,
) => {
  const result = await externalMovementsService.getTapAuthorisation({ res }, req.params.id)
  res.locals.prisonerDetails = {
    prisonerNumber: result.person.personIdentifier,
    lastName: result.person.lastName,
    firstName: result.person.firstName,
    dateOfBirth: result.person.dateOfBirth,
    prisonName: res.locals.user.activeCaseLoad?.description,
    cellLocation: result.person.cellLocation,
  }
  return result
}

export abstract class ManageTapAuthorisationBaseClass {
  constructor(readonly externalMovementsService: ExternalMovementsService) {}

  abstract handleGet(
    _authorisation: components['schemas']['TapAuthorisation'],
    _req: Request<{ id: string }>,
    _res: Response,
  ): Promise<unknown>

  GET = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const result = await getAuthorisationAndPopulatePrisonerDetails(this.externalMovementsService, req, res)
      await this.handleGet(result, req, res)
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
      res.notFound()
    }
  }
}
