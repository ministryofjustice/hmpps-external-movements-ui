import { BaseRouter } from '../../../../common/routes'
import { EditEndDateController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const EditEndDateRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new EditEndDateController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
