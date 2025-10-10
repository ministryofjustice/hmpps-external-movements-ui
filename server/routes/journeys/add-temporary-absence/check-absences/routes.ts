import { BaseRouter } from '../../../common/routes'
import { CheckPatternController } from './controller'

export const CheckPatternRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new CheckPatternController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
