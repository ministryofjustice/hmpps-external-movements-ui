import { BaseRouter } from '../../../../common/routes'
import { AddTapOccurrenceConfirmationController } from './controller'

export const AddTapOccurrenceConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new AddTapOccurrenceConfirmationController()

  get('/', controller.GET)

  return router
}
