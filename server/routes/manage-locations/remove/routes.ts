import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { RemoveLocationController } from './controller'
import { schema } from './schema'
import { validate } from '../../../middleware/validation/validationMiddleware'

export const RemoveLocationRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new RemoveLocationController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
