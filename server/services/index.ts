import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import logger from '../../logger'
import { dataAccess } from '../data'
import AuditService from './auditService'
import ExternalMovementsService from './apis/externalMovementsService'
import config from '../config'
import PrisonerSearchApiService from './apis/prisonerSearchService'
import PrisonApiService from './apis/prisonApiService'
import PersonalRelationshipsService from './apis/personalRelationshipsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, osPlacesApiClient, telemetryClient, authenticationClient, cacheStore } =
    dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    externalMovementsService: new ExternalMovementsService(authenticationClient),
    personalRelationshipsService: new PersonalRelationshipsService(
      cacheStore('address-reference'),
      authenticationClient,
    ),
    prisonerSearchService: new PrisonerSearchApiService(authenticationClient),
    prisonApiService: new PrisonApiService(authenticationClient),
    osPlacesAddressService: new OsPlacesAddressService(logger, osPlacesApiClient),
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
