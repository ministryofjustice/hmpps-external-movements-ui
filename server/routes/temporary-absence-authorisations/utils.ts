import { Request, Response } from 'express'
import ExternalMovementsService from '../../services/apis/externalMovementsService'

export const getAuthorisationAndPopulatePrisonerDetails = async (
  externalMovementsService: ExternalMovementsService,
  req: Request<{ id: string }>,
  res: Response,
  fromDate?: string | null,
  toDate?: string | null,
) => {
  const result = await externalMovementsService.getTapAuthorisation({ res }, req.params.id, fromDate, toDate)
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
