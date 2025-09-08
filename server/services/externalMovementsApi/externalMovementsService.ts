import ExternalMovementsApiClient from './externalMovementsApiClient'
import { ApiRequestContext } from '../../data/customRestClient'

export default class ExternalMovementsService {
  constructor(private readonly externalMovementsApiClient: ExternalMovementsApiClient) {}

  async getAllAbsenceTypes(context: ApiRequestContext) {
    return this.externalMovementsApiClient.getAllAbsenceTypes(context)
  }

  async getAbsenceCategories(
    context: ApiRequestContext,
    parentDomain: 'ABSENCE_TYPE' | 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY',
    parentCode: string,
  ) {
    return this.externalMovementsApiClient.getAbsenceCategories(context, parentDomain, parentCode)
  }
}
