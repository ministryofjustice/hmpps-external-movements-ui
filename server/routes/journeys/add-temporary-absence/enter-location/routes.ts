import { BaseRouter } from '../../../common/routes'
import { EnterLocationController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const EnterLocationRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new EnterLocationController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
