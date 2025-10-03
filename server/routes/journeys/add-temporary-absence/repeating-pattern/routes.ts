import { BaseRouter } from '../../../common/routes'
import { RepeatingPatternController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const RepeatingPatternRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new RepeatingPatternController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
