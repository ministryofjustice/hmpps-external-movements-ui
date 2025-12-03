import { BaseRouter } from '../../../../common/routes'
import { TapReviewController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const TapReviewRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new TapReviewController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
