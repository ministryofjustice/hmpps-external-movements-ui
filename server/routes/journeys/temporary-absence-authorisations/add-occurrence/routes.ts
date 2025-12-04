import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { Page } from '../../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../../middleware/journey/preventNavigationToExpiredJourneys'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { AddOccurrenceController } from './controller'

export const AddTapOccurrenceRoutes = (_services: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new AddOccurrenceController()

  get(
    '*any',
    Page.ADD_TEMPORARY_ABSENCE_OCCURRENCE,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
  )

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
