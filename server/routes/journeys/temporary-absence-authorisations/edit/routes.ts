import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { EditAbsenceCommentsRoutes } from './comments/routes'
import { EditStartEndDatesRoutes } from './start-end-dates/routes'
import { EditAbsenceTypeRoutes } from './absence-type/routes'
import { EditAbsenceSubTypeRoutes } from './absence-subtype/routes'
import { EditReasonCategoryRoutes } from './reason-category/routes'
import { EditAbsenceReasonRoutes } from './reason/routes'
import { EditTapAuthorisationConfirmationRoutes } from './confirmation/routes'
import { TapCancelRoutes } from './cancel/routes'
import { TapReviewRoutes } from './review/routes'
import { TapReviewReasonRoutes } from './review-reason/routes'
import { Page } from '../../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../../middleware/journey/preventNavigationToExpiredJourneys'
import { EditTapAuthorisationChangeConfirmationRoutes } from './change-confirmation/routes'
import { EditTapAuthorisationAccompaniedOrUnaccompaniedRoutes } from './accompanied-or-unaccompanied/routes'
import { EditTapAuthorisationAccompaniedRoutes } from './accompanied/routes'

export const EditTapAuthorisationRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get(
    '*any',
    Page.EDIT_TEMPORARY_ABSENCE_AUTHORISATION,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
  )

  router.use('/absence-type', EditAbsenceTypeRoutes(services))
  router.use('/absence-subtype', EditAbsenceSubTypeRoutes(services))
  router.use('/reason-category', EditReasonCategoryRoutes(services))
  router.use('/reason', EditAbsenceReasonRoutes(services))
  router.use('/comments', EditAbsenceCommentsRoutes())
  router.use('/start-end-dates', EditStartEndDatesRoutes(services))
  router.use('/accompanied-or-unaccompanied', EditTapAuthorisationAccompaniedOrUnaccompaniedRoutes())
  router.use('/accompanied', EditTapAuthorisationAccompaniedRoutes(services))

  router.use('/cancel', TapCancelRoutes(services))
  router.use('/review', TapReviewRoutes())
  router.use('/review-reason', TapReviewReasonRoutes(services))

  router.use('/change-confirmation', EditTapAuthorisationChangeConfirmationRoutes(services))

  router.use('/confirmation', EditTapAuthorisationConfirmationRoutes())

  return router
}
