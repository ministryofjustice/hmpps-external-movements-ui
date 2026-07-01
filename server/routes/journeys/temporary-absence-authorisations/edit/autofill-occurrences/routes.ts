import { BaseRouter } from '../../../../common/routes'
import { EditTapAutofillOccurrencesController } from './controller'
import { Services } from '../../../../../services'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const EditTapAutofillOccurrencesRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapAutofillOccurrencesController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
