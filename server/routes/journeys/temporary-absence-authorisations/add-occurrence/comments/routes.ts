import { BaseRouter } from '../../../../common/routes'
import { AddTapOccurrenceCommentsController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const AddTapOccurrenceCommentsRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new AddTapOccurrenceCommentsController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
