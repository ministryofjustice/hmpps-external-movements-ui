import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import logger from '../../logger'
import { dataAccess } from '../data'
import AuditService from './auditService'
import ExternalMovementsService from './externalMovementsApi/externalMovementsService'
import config from '../config'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, externalMovementsApiClient, tokenStore } = dataAccess()

  const authenticationClient = new AuthenticationClient(config.apis.hmppsAuth, logger, tokenStore)

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    externalMovementsService: new ExternalMovementsService(externalMovementsApiClient),
    authenticationClient,
  }
}

export type Services = ReturnType<typeof services>
