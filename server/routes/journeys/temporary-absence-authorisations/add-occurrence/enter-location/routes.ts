import { AddTapOccurrenceEnterLocationController } from './controller'
import { BaseRouter } from '../../../../common/routes'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const AddTapOccurrenceEnterLocationRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new AddTapOccurrenceEnterLocationController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
