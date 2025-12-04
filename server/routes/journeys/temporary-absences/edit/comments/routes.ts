import { BaseRouter } from '../../../../common/routes'
import { EditAbsenceCommentsController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../../services'

export const EditAbsenceCommentsRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditAbsenceCommentsController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
