import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { BrowseTapOccurrencesController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'
import { TapOccurrenceDetailsController } from './details/controller'

export const BrowseTapOccurrencesRoutes = ({ externalMovementsService }: Services) => {
  const { router, get } = BaseRouter()
  const controller = new BrowseTapOccurrencesController(externalMovementsService)

  get('/', validateOnGET(schemaFactory, 'searchTerm', 'fromDate', 'toDate', 'status', 'page'), controller.GET)

  get('/:id', new TapOccurrenceDetailsController(externalMovementsService).GET)

  return router
}
