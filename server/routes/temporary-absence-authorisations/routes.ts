import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { BrowseTapAuthorisationsController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { TapAuthorisationDetailsController } from './details/controller'
import { TapApprovalRoutes } from './approval/routes'
import { TapCancelRoutes } from './cancel/routes'
import { TapOccurrenceDetailsController } from './occurrence/controller'

export const BrowseTapAuthorisationsRoutes = (services: Services) => {
  const { externalMovementsService } = services
  const { router, get } = BaseRouter()
  const controller = new BrowseTapAuthorisationsController(externalMovementsService)

  get('/', validateOnGET(schema, 'searchTerm', 'fromDate', 'toDate', 'status'), controller.GET)
  get('/:id', new TapAuthorisationDetailsController(externalMovementsService).GET)
  get('/:id/occurrence/:occurrenceId', new TapOccurrenceDetailsController(externalMovementsService).GET)

  router.use('/:id/approval', TapApprovalRoutes(services))
  router.use('/:id/cancel', TapCancelRoutes(services))

  return router
}
