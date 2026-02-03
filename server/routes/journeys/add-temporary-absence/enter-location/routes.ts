import { EnterLocationController } from './controller'
import { BaseRouter } from '../../../common/routes'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { enterLocationSchema } from './schema'

export const EnterLocationRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new EnterLocationController()

  get('/', controller.GET)
  post('/', validate(enterLocationSchema), controller.POST)

  return router
}
