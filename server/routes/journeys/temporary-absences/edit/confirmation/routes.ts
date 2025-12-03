import { BaseRouter } from '../../../../common/routes'
import { EditTapOccurrenceConfirmationController } from './controller'

export const EditTapOccurrenceConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new EditTapOccurrenceConfirmationController()

  get('/', controller.GET)

  return router
}
