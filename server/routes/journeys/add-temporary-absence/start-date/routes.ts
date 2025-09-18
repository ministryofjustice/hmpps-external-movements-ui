import { BaseRouter } from '../../../common/routes'
import { StartDateController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const StartDateRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new StartDateController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
