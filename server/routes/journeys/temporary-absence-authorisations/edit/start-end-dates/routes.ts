import { BaseRouter } from '../../../../common/routes'
import { EditStartEndDatesController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const EditStartEndDatesRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new EditStartEndDatesController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
