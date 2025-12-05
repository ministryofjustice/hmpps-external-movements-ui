import { BaseRouter } from '../../../../common/routes'
import { AddTapOccurrenceCheckAnswersController } from './controller'
import { Services } from '../../../../../services'

export const AddTapOccurrenceCheckAnswersRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new AddTapOccurrenceCheckAnswersController(externalMovementsService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
