import { Request, Response } from 'express'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import PrisonerSearchApiService from '../../services/apis/prisonerSearchService'

export const getMovementAndPopulatePrisonerDetails = async (
  externalMovementsService: ExternalMovementsService,
  prisonerSearchApiService: PrisonerSearchApiService,
  req: Request<{ id: string }>,
  res: Response,
) => {
  const result = await externalMovementsService.getTapMovement({ res }, req.params.id)
  res.locals.prisonerDetails = await prisonerSearchApiService.getPrisonerDetails(
    { res },
    result.person.personIdentifier,
  )
  return result
}
