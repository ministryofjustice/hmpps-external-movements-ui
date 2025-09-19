import { BaseRouter } from '../../../common/routes'
import { AddTapCheckAnswersController } from './controller'
import { Services } from '../../../../services'

export const AddTapCheckAnswersRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new AddTapCheckAnswersController(externalMovementsService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
