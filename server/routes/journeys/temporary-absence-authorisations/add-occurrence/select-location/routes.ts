import { BaseRouter } from '../../../../common/routes'
import { AddTapOccurrenceSelectLocationController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const AddTapOccurrenceSelectLocationRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new AddTapOccurrenceSelectLocationController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
