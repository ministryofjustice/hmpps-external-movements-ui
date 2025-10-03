import { BaseRouter } from '../../../common/routes'
import { StartEndDatesController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const StartEndDatesRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new StartEndDatesController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
