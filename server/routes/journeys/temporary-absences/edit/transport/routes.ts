import { EditTransportController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schemas'
import { BaseRouter } from '../../../../common/routes'
import { Services } from '../../../../../services'

export const EditTransportRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTransportController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(externalMovementsService)), controller.POST)

  return router
}
