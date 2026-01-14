import { BaseRouter } from '../../../common/routes'
import { StartEndDateTimeController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const StartEndDateTimeRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new StartEndDateTimeController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
