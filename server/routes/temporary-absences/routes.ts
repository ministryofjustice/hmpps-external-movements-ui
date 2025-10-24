import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { BrowseTapOccurrencesController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const BrowseTapOccurrencesRoutes = ({ externalMovementsService }: Services) => {
  const { router, get } = BaseRouter()
  const controller = new BrowseTapOccurrencesController(externalMovementsService)

  get('/', validateOnGET(schemaFactory, 'searchTerm', 'fromDate', 'toDate', 'status', 'direction'), controller.GET)

  return router
}
