import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { Response } from 'superagent'
import config from '../../config'
import logger from '../../../logger'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import { components } from '../../@types/externalMovements'

export default class ExternalMovementsApiClient extends CustomRestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super(
      'External Movements API',
      config.apis.externalMovementsApi,
      logger,
      authenticationClient,
      true,
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

  async getAllAbsenceTypes(context: ApiRequestContext) {
    return this.withContext(context).get<components['schemas']['AbsenceCategorisations']>({
      path: '/absence-categorisation/ABSENCE_TYPE',
    })
  }

  async getAbsenceCategories(
    context: ApiRequestContext,
    parentDomain: 'ABSENCE_TYPE' | 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY',
    parentCode: string,
  ) {
    return this.withContext(context).get<components['schemas']['AbsenceCategorisations']>({
      path: `/absence-categorisation/${parentDomain}/${parentCode}`,
    })
  }
}
