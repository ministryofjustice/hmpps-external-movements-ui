import { Response } from 'express'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import Prisoner from './prisoner'
import config from '../../config'
import logger from '../../../logger'

export default class PrisonerSearchApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prison Offender Search API', config.apis.prisonerSearchApi, logger, authenticationClient)
  }

  async getPrisonerDetails(res: Response, prisonerNumber: string): Promise<Prisoner> {
    return this.get<Prisoner>({ path: `/prisoner/${prisonerNumber}` }, asSystem(res.locals.user.username))
  }

  async searchPrisoner(res: Response, searchTerm: string): Promise<{ content: Prisoner[] }> {
    return this.get<{ content: Prisoner[] }>(
      { path: `/prison/${res.locals.user.getActiveCaseloadId()}/prisoners?term=${encodeURIComponent(searchTerm)}` },
      asSystem(res.locals.user.username),
    )
  }
}
