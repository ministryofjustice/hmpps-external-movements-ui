import { BaseRouter } from '../../../common/routes'
import { FreeformSelectDaysController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const FreeformSelectDaysRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new FreeformSelectDaysController()

  get('/', controller.GET)
  get('/:idx', controller.GET)

  post('/', validate(schema), controller.POST)
  post('/:idx', validate(schema), controller.POST)

  return router
}
