import { BaseRouter } from '../../../common/routes'
import { ConfirmLocationController } from './controller'

export const ConfirmLocationRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new ConfirmLocationController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
