import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { Page } from '../../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../../middleware/journey/preventNavigationToExpiredJourneys'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { AddOccurrenceController } from './controller'
import { AddTapOccurrenceSelectLocationRoutes } from './select-location/routes'
import { AddTapOccurrenceCommentsRoutes } from './comments/routes'
import { AddTapOccurrenceCheckAnswersRoutes } from './check-answers/routes'

export const AddTapOccurrenceRoutes = (services: Services) => {
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

  router.use('/select-location', AddTapOccurrenceSelectLocationRoutes())
  router.use('/comments', AddTapOccurrenceCommentsRoutes())
  router.use('/check-answers', AddTapOccurrenceCheckAnswersRoutes(services))

  return router
}
