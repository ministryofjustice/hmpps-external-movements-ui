import { BaseRouter } from '../../../common/routes'
import { AccompaniedOrUnaccompaniedController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const AccompaniedOrUnaccompaniedRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new AccompaniedOrUnaccompaniedController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
