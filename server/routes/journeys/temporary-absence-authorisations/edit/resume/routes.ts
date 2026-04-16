import { Services } from '../../../../../services'
import { BaseRouter } from '../../../../common/routes'
import { TapResumeController } from './controller'

export const TapResumeRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new TapResumeController(externalMovementsService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
