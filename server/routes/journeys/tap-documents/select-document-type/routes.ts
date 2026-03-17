import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { SelectDocumentTypeController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const SelectDocumentTypeRoutes = ({ documentGenerationService }: Services) => {
  const { router, get, post } = BaseRouter()

  const controller = new SelectDocumentTypeController(documentGenerationService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
