import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { Response as SuperAgentResponse } from 'superagent'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { components } from '../../@types/documentGeneration'

export type DOCUMENT_TYPE = 'TEMPORARY_ABSENCE' | 'EXTERNAL_MOVEMENT'

export default class DocumentGenerationService {
  private apiClient: CustomRestClient

  constructor(authenticationClient: AuthenticationClient) {
    this.apiClient = new CustomRestClient(
      'Document Generation API',
      config.apis.documentGenerationApi,
      logger,
      authenticationClient,
      true,
      (retry?: boolean) => (err: Error, res: SuperAgentResponse) => {
        if (!retry) return false
        if (err) return true
        if (res?.statusCode) {
          return res.statusCode >= 500
        }
        return undefined
      },
    )
  }

  async getTemplateById(context: ApiRequestContext, id: string) {
    return this.apiClient
      .withContext(context)
      .get<components['schemas']['TemplateDetail']>({ path: `/templates/${id}` })
  }

  async getTemplatesForGroup(context: ApiRequestContext, group: DOCUMENT_TYPE) {
    return this.apiClient
      .withContext(context)
      .get<components['schemas']['TemplateGroupTemplates']>({ path: `/groups/${group} ` })
  }
}
