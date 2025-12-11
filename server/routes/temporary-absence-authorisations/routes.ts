import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { BrowseTapAuthorisationsController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { TapAuthorisationDetailsController } from './details/controller'
import { schema as detailsSchema } from './details/schema'

export const BrowseTapAuthorisationsRoutes = (services: Services) => {
  const { externalMovementsService } = services
  const { router, get } = BaseRouter()
  const controller = new BrowseTapAuthorisationsController(externalMovementsService)

  get('/', validateOnGET(schema, 'searchTerm', 'start', 'end', 'status', 'page', 'sort'), controller.GET)
  get(
    '/:id',
    validateOnGET(detailsSchema, 'dateFrom', 'dateTo'),
    new TapAuthorisationDetailsController(externalMovementsService).GET,
  )

  return router
}
