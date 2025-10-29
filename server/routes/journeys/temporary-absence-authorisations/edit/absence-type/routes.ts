import { BaseRouter } from '../../../../common/routes'
import { EditAbsenceTypeController } from './controller'
import { Services } from '../../../../../services'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const EditAbsenceTypeRoutes = ({ externalMovementsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditAbsenceTypeController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(externalMovementsService)), controller.POST)

  return router
}
