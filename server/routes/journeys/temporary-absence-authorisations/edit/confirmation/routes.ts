import { BaseRouter } from '../../../../common/routes'
import { EditTapAuthorisationConfirmationController } from './controller'

export const EditTapAuthorisationConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new EditTapAuthorisationConfirmationController()

  get('/', controller.GET)

  return router
}
