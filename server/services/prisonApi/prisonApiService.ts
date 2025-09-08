import { Readable } from 'stream'
import PrisonApiClient from './prisonApiClient'
import { ApiRequestContext } from '../../data/customRestClient'

export default class PrisonApiService {
  constructor(private readonly prisonApiClient: PrisonApiClient) {}

  getPrisonerImage(context: ApiRequestContext, prisonNumber: string): Promise<Readable> {
    return this.prisonApiClient.getPrisonerImage(context, prisonNumber)
  }
}
