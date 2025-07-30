import { dataAccess } from '../data'
import AuditService from './auditService'
import ExternalMovementsService from './externalMovementsApi/externalMovementsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, externalMovementsApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    externalMovementsService: new ExternalMovementsService(externalMovementsApiClient),
  }
}

export type Services = ReturnType<typeof services>
