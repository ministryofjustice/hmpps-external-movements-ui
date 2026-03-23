import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { TemporaryAbsenceScheduleEnquiryController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Page } from '../../services/auditService'

export const TemporaryAbsenceScheduleEnquiryRoutes = (services: Services) => {
  const { externalMovementsService } = services
  const { router, get } = BaseRouter()
  const controller = new TemporaryAbsenceScheduleEnquiryController(externalMovementsService)

  get(
    '/',
    Page.TEMPORARY_ABSENCE_SCHEDULE_ENQUIRY,
    validateOnGET(schema, 'start', 'end', 'status', 'page', 'sort'),
    controller.GET,
  )

  return router
}
