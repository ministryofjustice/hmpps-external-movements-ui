import { Response } from 'express'
import Prisoner from './prisoner'
import PrisonerSearchApiClient from './prisonerSearchApiClient'

export default class PrisonerSearchApiService {
  constructor(private readonly prisonerSearchApiClient: PrisonerSearchApiClient) {}

  getPrisonerDetails(res: Response, prisonerNumber: string): Promise<Prisoner> {
    return this.prisonerSearchApiClient.getPrisonerDetails(res, prisonerNumber)
  }

  searchPrisoner(res: Response, searchTerm: string): Promise<{ content: Prisoner[] }> {
    return this.prisonerSearchApiClient.searchPrisoner(res, searchTerm)
  }
}
