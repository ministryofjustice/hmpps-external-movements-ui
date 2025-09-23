import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { populatePrisonerDetails, toPrisonerDetails } from '../../../middleware/populatePrisonerDetails'
import { AbsenceTypeRoutes } from './absence-type/routes'
import { Page } from '../../../services/auditService'
import { AbsenceSubTypeRoutes } from './absence-subtype/routes'
import { ReasonCategoryRoutes } from './reason-category/routes'
import { AbsenceReasonRoutes } from './reason/routes'
import { SingleOrRepeatingRoutes } from './single-or-repeating/routes'
import { StartDateRoutes } from './start-date/routes'
import { EndDateRoutes } from './end-date/routes'
import { LocationTypeRoutes } from './location-type/routes'
import { AddTapCheckAnswersRoutes } from './check-answers/routes'
import { LocationSearchRoutes } from './location-search/routes'
import { AccompaniedOrUnaccompaniedRoutes } from './accompanied-or-unaccompanied/routes'
import { TransportRoutes } from './transport/routes'
import { AbsenceCommentsRoutes } from './comments/routes'
import { AbsenceApprovalRoutes } from './approval/routes'

export const AddTemporaryAbsenceRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get('/start/:prisonNumber', populatePrisonerDetails(services), (req, res) => {
    if (req.middleware?.prisonerData) {
      req.journeyData.addTemporaryAbsence = {}
      req.journeyData.prisonerDetails = toPrisonerDetails(req.middleware.prisonerData)
      res.redirect('../absence-type')
    } else {
      res.notFound()
    }
  })

  get('*any', Page.ADD_TEMPORARY_ABSENCE, (req, res, next) => {
    if (req.journeyData.prisonerDetails) {
      res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
    }
    next()
  })

  router.use('/absence-type', AbsenceTypeRoutes(services))
  router.use('/absence-subtype', AbsenceSubTypeRoutes(services))
  router.use('/reason-category', ReasonCategoryRoutes(services))
  router.use('/reason', AbsenceReasonRoutes(services))
  router.use('/single-or-repeating', SingleOrRepeatingRoutes())
  router.use('/start-date', StartDateRoutes())
  router.use('/end-date', EndDateRoutes())
  router.use('/location-type', LocationTypeRoutes(services))
  router.use('/location-search', LocationSearchRoutes())
  router.use('/accompanied-or-unaccompanied', AccompaniedOrUnaccompaniedRoutes())
  router.use('/transport', TransportRoutes(services))
  router.use('/comments', AbsenceCommentsRoutes())
  router.use('/approval', AbsenceApprovalRoutes())
  router.use('/check-answers', AddTapCheckAnswersRoutes(services))

  return router
}
