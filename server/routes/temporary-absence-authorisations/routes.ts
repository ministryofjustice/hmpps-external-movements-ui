import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { BrowseTapAuthorisationsController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { TapAuthorisationDetailsController } from './details/controller'

export const BrowseTapAuthorisationsRoutes = ({ externalMovementsService }: Services) => {
  const { router, get } = BaseRouter()
  const controller = new BrowseTapAuthorisationsController(externalMovementsService)

  get('/', validateOnGET(schema, 'searchTerm', 'fromDate', 'toDate', 'status'), controller.GET)
  get('/:id', new TapAuthorisationDetailsController(externalMovementsService).GET)

  return router
}
