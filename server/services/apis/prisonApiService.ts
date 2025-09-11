import { Readable } from 'stream'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'

export default class PrisonApiService {
  private prisonApiClient: RestClient

  constructor(authenticationClient: AuthenticationClient) {
    this.prisonApiClient = new RestClient('Prison API', config.apis.prisonApi, logger, authenticationClient)
  }

  getPrisonerImage({ res }: ApiRequestContext, prisonNumber: string): Promise<Readable> {
    return this.prisonApiClient.stream(
      { path: `/api/bookings/offenderNo/${prisonNumber}/image/data` },
      asSystem(res.locals.user.username),
    )
  }
}
