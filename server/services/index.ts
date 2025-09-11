import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import logger from '../../logger'
import { dataAccess } from '../data'
import AuditService from './auditService'
import ExternalMovementsService from './externalMovementsApi/externalMovementsService'
import config from '../config'
import PrisonerSearchApiService from './prisonerSearch/prisonerSearchService'
import PrisonApiService from './prisonApi/prisonApiService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuditClient,
    externalMovementsApiClient,
    prisonerSearchApiClient,
    prisonApiClient,
    tokenStore,
    telemetryClient,
    cacheStore,
  } = dataAccess()

  const authenticationClient = new AuthenticationClient(config.apis.hmppsAuth, logger, tokenStore)

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    externalMovementsService: new ExternalMovementsService(externalMovementsApiClient),
    prisonerSearchService: new PrisonerSearchApiService(prisonerSearchApiClient),
    prisonApiService: new PrisonApiService(prisonApiClient),
    prisonPermissionsService: PermissionsService.create({
      prisonerSearchConfig: config.apis.prisonerSearchApi,
      authenticationClient,
      logger,
      telemetryClient,
    }),
    authenticationClient,
    cacheStore,
  }
}

export type Services = ReturnType<typeof services>
