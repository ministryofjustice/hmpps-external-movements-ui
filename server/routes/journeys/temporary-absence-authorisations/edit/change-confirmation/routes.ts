import { BaseRouter } from '../../../../common/routes'
import { EditTapAuthorisationChangeConfirmationController } from './controller'
import { Services } from '../../../../../services'

export const EditTapAuthorisationChangeConfirmationRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapAuthorisationChangeConfirmationController(externalMovementsService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
