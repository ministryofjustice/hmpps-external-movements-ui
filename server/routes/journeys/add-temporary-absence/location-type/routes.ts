import { LocationTypeController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schemas'
import { BaseRouter } from '../../../common/routes'
import ExternalMovementsService from '../../../../services/apis/externalMovementsService'

export const LocationTypeRoutes = (externalMovementsService: ExternalMovementsService) => {
  const { router, get, post } = BaseRouter()
  const controller = new LocationTypeController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(externalMovementsService)), controller.POST)

  return router
}
