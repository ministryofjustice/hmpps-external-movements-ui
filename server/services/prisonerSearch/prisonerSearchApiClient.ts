import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { Response } from 'superagent'
import Prisoner from './prisoner'
import config from '../../config'
import logger from '../../../logger'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'

export default class PrisonerSearchApiClient extends CustomRestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super(
      'Prison Offender Search API',
      config.apis.prisonerSearchApi,
      logger,
      authenticationClient,
      false,
      (retry?: boolean) => (err: Error, res: Response) => {
        if (!retry) return false
        if (err) return true
        if (res?.statusCode) {
          return res.statusCode >= 500
        }
        return undefined
      },
    )
  }

  async getPrisonerDetails(context: ApiRequestContext, prisonerNumber: string): Promise<Prisoner> {
    return this.withContext(context).get<Prisoner>({ path: `/prisoner/${prisonerNumber}` })
  }

  async searchPrisoner(context: ApiRequestContext, searchTerm: string): Promise<{ content: Prisoner[] }> {
    return this.withContext(context).get<{ content: Prisoner[] }>({
      path: `/prison/${context.res.locals.user.getActiveCaseloadId()}/prisoners?term=${encodeURIComponent(searchTerm)}`,
    })
  }
}
