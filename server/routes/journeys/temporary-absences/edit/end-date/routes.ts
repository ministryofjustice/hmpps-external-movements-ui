import { BaseRouter } from '../../../../common/routes'
import { EditEndDateController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../../services'

export const EditEndDateRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditEndDateController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
