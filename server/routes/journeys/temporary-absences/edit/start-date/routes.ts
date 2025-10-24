import { BaseRouter } from '../../../../common/routes'
import { EditStartDateController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const EditStartDateRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new EditStartDateController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
