import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { TapCancelController } from './controller'
import { validate } from '../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const TapCancelRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new TapCancelController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
