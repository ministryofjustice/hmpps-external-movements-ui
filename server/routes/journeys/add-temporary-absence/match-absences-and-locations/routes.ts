import { MatchAbsencesAndLocationsController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { BaseRouter } from '../../../common/routes'

export const MatchAbsencesAndLocationsRoute = () => {
  const { router, get, post } = BaseRouter()
  const controller = new MatchAbsencesAndLocationsController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
