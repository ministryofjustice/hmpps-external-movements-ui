import { BaseRouter } from '../../../common/routes'
import { AbsenceApprovalController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const AbsenceApprovalRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new AbsenceApprovalController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
