import { BaseRouter } from '../../../common/routes'
import { AbsenceTypeController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'
import { populateSwitchOffBanner } from '../../../../middleware/populateSwitchOffBanner'

export const AbsenceTypeRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new AbsenceTypeController(externalMovementsService)

  get('/', populateSwitchOffBanner, controller.GET)
  post('/', validate(schemaFactory(externalMovementsService)), controller.POST)

  return router
}
