import { RotatingReleaseReturnTimesController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schemas'
import { BaseRouter } from '../../../common/routes'

export const RotatingReleaseReturnTimesRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new RotatingReleaseReturnTimesController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
