import { EditTapOccurrenceSearchLocationController } from './controller'
import { BaseRouter } from '../../../../common/routes'
import { Services } from '../../../../../services'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const EditTapOccurrenceSearchLocationRoutes = ({
  osPlacesAddressService,
  externalMovementsService,
}: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTapOccurrenceSearchLocationController(externalMovementsService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(osPlacesAddressService)), controller.submitToApi, controller.POST)

  return router
}
