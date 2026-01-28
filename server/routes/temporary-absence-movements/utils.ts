import { Request, Response } from 'express'
import ExternalMovementsService from '../../services/apis/externalMovementsService'

export const getMovementAndPopulatePrisonerDetails = async (
  externalMovementsService: ExternalMovementsService,
  req: Request<{ id: string }>,
  res: Response,
) => {
  const result = await externalMovementsService.getTapMovement({ res }, req.params.id)
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
