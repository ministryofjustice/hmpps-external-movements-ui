import Prisoner from './prisoner'
import PrisonerSearchApiClient from './prisonerSearchApiClient'
import { ApiRequestContext } from '../../data/customRestClient'

export default class PrisonerSearchApiService {
  constructor(private readonly prisonerSearchApiClient: PrisonerSearchApiClient) {}

  getPrisonerDetails(context: ApiRequestContext, prisonerNumber: string): Promise<Prisoner> {
    return this.prisonerSearchApiClient.getPrisonerDetails(context, prisonerNumber)
  }

  searchPrisoner(context: ApiRequestContext, searchTerm: string): Promise<{ content: Prisoner[] }> {
    return this.prisonerSearchApiClient.searchPrisoner(context, searchTerm)
  }
}
