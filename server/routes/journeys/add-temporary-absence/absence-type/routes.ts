import { BaseRouter } from '../../../common/routes'
import { AbsenceTypeController } from './controller'
import { Services } from '../../../../services'

export const AbsenceTypeRoutes = ({ externalMovementsService }: Services) => {
  const { router, get } = BaseRouter()
  const controller = new AbsenceTypeController(externalMovementsService)

  get('/', controller.GET)

  return router
}
