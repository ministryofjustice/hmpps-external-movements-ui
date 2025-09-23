import { BaseRouter } from '../../../common/routes'
import { AbsenceCommentsController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const AbsenceCommentsRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new AbsenceCommentsController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
