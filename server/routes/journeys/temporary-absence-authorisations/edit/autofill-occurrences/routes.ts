import { BaseRouter } from '../../../../common/routes'
import { EditTapAutofillOccurrencesController } from './controller'
import { Services } from '../../../../../services'

export const EditTapAutofillOccurrencesRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapAutofillOccurrencesController(externalMovementsService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
