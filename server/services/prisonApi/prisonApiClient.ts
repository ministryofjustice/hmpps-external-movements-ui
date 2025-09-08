import { Readable } from 'stream'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../../config'
import logger from '../../../logger'
import { ApiRequestContext } from '../../data/customRestClient'

export default class PrisonApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prison API', config.apis.prisonApi, logger, authenticationClient)
  }

  async getPrisonerImage({ res }: ApiRequestContext, prisonNumber: string): Promise<Readable> {
    return this.stream(
      { path: `/api/bookings/offenderNo/${prisonNumber}/image/data` },
      asSystem(res.locals.user.username),
    )
  }
}
