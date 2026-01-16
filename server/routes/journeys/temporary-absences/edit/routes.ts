import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { EditOccurrenceStartEndDatesRoutes } from './start-end-dates/routes'
import { EditTapOccurrenceConfirmationRoutes } from './confirmation/routes'
import { TapOccurrenceCancelRoutes } from './cancel/routes'
import { Page } from '../../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../../middleware/journey/preventNavigationToExpiredJourneys'
import { EditAbsenceCommentsRoutes } from './comments/routes'
import { EditTransportRoutes } from './transport/routes'
import { EditTapOccurrenceSearchLocationRoutes } from './search-location/routes'
import { EditTapOccurrenceSelectLocationRoutes } from './select-location/routes'
import { EditTapOccurrenceEnterLocationRoutes } from './enter-location/routes'

export const EditTapOccurrenceRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get(
    '*any',
    Page.EDIT_TEMPORARY_ABSENCE_OCCURRENCE,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
  )

  router.use('/start-end-dates', EditOccurrenceStartEndDatesRoutes(services))
  router.use('/cancel', TapOccurrenceCancelRoutes(services))
  router.use('/confirmation', EditTapOccurrenceConfirmationRoutes())
  router.use('/comments', EditAbsenceCommentsRoutes(services))
  router.use('/transport', EditTransportRoutes(services))

  router.get('/location', (req, res) =>
    res.redirect(
      req.journeyData.updateTapOccurrence!.authorisation.locations.length <= 1 ? 'search-location' : 'select-location',
    ),
  )

  router.use('/select-location', EditTapOccurrenceSelectLocationRoutes(services))
  router.use('/search-location', EditTapOccurrenceSearchLocationRoutes(services))
  router.use('/enter-location', EditTapOccurrenceEnterLocationRoutes(services))

  return router
}
