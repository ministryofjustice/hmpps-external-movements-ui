import { BaseRouter } from '../../../common/routes'
import { AddAbsenceConfirmationController } from './controller'

export const AddAbsenceConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new AddAbsenceConfirmationController()

  get('/', controller.GET)

  return router
}
