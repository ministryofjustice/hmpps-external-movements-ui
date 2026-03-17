import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { SelectAbsencePlanController } from './controller'

export const SelectAbsencePlanRoutes = ({ externalMovementsService }: Services) => {
  const { router, get } = BaseRouter()

  const controller = new SelectAbsencePlanController(externalMovementsService)

  get('/', controller.GET)

  return router
}
