import { Request, Response } from 'express'
import ExternalMovementsService from '../../services/apis/externalMovementsService'
import PrisonerSearchApiService from '../../services/apis/prisonerSearchService'

export const getAuthorisationAndPopulatePrisonerDetails = async (
  externalMovementsService: ExternalMovementsService,
  prisonerSearchApiService: PrisonerSearchApiService,
  req: Request<{ id: string }>,
  res: Response,
  start?: string | null,
  end?: string | null,
) => {
  const result = await externalMovementsService.getTapAuthorisation({ res }, req.params.id, start, end)
  res.locals.prisonerDetails = await prisonerSearchApiService.getPrisonerDetails(
    { res },
    result.person.personIdentifier,
  )
  return result
}
