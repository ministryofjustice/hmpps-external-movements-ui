import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import logger from '../../logger'
import { dataAccess } from '../data'
import AuditService from './auditService'
import ExternalMovementsService from './apis/externalMovementsService'
import config from '../config'
import PrisonerSearchApiService from './apis/prisonerSearchService'
import PrisonApiService from './apis/prisonApiService'
import CustomOsPlacesAddressService from './apis/osPlacesAddressService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, osPlacesApiClient, telemetryClient, authenticationClient, cacheStore } =
    dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    externalMovementsService: new ExternalMovementsService(authenticationClient),
    prisonerSearchService: new PrisonerSearchApiService(authenticationClient),
    prisonApiService: new PrisonApiService(authenticationClient),
    osPlacesAddressService: new CustomOsPlacesAddressService(logger, osPlacesApiClient),
    prisonPermissionsService: PermissionsService.create({
      prisonerSearchConfig: config.apis.prisonerSearchApi,
      authenticationClient,
      logger,
      telemetryClient,
    }),
    authenticationClient,
    cacheStore,
    telemetryClient,
  }
}

export type Services = ReturnType<typeof services>
