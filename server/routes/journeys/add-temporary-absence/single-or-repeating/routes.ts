import { BaseRouter } from '../../../common/routes'
import { SingleOrRepeatingController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const SingleOrRepeatingRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new SingleOrRepeatingController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
