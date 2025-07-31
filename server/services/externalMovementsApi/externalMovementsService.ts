import ExternalMovementsApiClient from './externalMovementsApiClient'

export default class ExternalMovementsService {
  // @ts-expect-error placeholder api client
  constructor(private readonly externalMovementsApiClient: ExternalMovementsApiClient) {}
}
