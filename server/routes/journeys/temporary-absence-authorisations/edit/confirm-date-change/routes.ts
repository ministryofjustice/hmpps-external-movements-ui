import { BaseRouter } from '../../../../common/routes'
import { EditTapConfirmDateChangeController } from './controller'
import { Services } from '../../../../../services'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const EditTapAutofillOccurrencesRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapConfirmDateChangeController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
