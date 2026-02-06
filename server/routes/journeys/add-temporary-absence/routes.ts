import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { populatePrisonerDetails, toPrisonerDetails } from '../../../middleware/populatePrisonerDetails'
import { AbsenceTypeRoutes } from './absence-type/routes'
import { Page } from '../../../services/auditService'
import { AbsenceSubTypeRoutes } from './absence-subtype/routes'
import { ReasonCategoryRoutes } from './reason-category/routes'
import { AbsenceReasonRoutes } from './reason/routes'
import { SingleOrRepeatingRoutes } from './single-or-repeating/routes'
import { StartEndDateTimeRoutes } from './start-end-dates-and-times/routes'
import { AddTapCheckAnswersRoutes } from './check-answers/routes'
import { AccompaniedOrUnaccompaniedRoutes } from './accompanied-or-unaccompanied/routes'
import { AccompaniedRoutes } from './accompanied/routes'
import { TransportRoutes } from './transport/routes'
import { AbsenceCommentsRoutes } from './comments/routes'
import { AbsenceApprovalRoutes } from './approval/routes'
import { AddAbsenceConfirmationRoutes } from './confirmation/routes'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import { StartEndDatesRoutes } from './start-end-dates/routes'
import { RepeatingPatternRoutes } from './repeating-pattern/routes'
import { FreeformSelectDaysRoutes } from './select-days-and-times/routes'
import { CheckPatternRoutes } from './check-absences/routes'
import { SearchLocationRoutes } from './search-location/routes'
import { SelectDaysTimesWeeklyRoutes } from './select-days-times-weekly/routes'
import { SearchLocationsRoutes } from './search-locations/routes'
import { MatchAbsencesAndLocationsRoute } from './match-absences-and-locations/routes'
import { EnterShiftPatternRoutes } from './enter-shift-pattern/routes'
import { SelectDaysTimesBiWeeklyRoutes } from './select-days-times-biweekly/routes'
import { EnterLocationRoutes } from './enter-location/routes'
import { guard } from './stateRules'
import { MultiAbsencesPerDayRoutes } from './multi-absences-per-day/routes'

export const AddTemporaryAbsenceRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get('/start/:prisonNumber', populatePrisonerDetails(services), (req, res) => {
    if (req.middleware?.prisonerData) {
      req.journeyData.prisonerDetails = toPrisonerDetails(req.middleware.prisonerData)

      const lastLandmark = res.locals.breadcrumbs.last()
      req.journeyData.addTemporaryAbsence = {
        backUrl:
          lastLandmark && ['temp-page-2', 'temp-page-3', Page.SEARCH_PRISONER].includes(lastLandmark.alias || '')
            ? lastLandmark.href
            : `${res.locals.prisonerProfileUrl}/prisoner/${req.journeyData.prisonerDetails.prisonerNumber}`,
        historyQuery: String(req.query['history']),
      }
      res.redirect('../absence-type')
    } else {
      res.notFound()
    }
  })

  get(
    '*any',
    Page.ADD_TEMPORARY_ABSENCE,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
    journeyStateGuard(guard, services.telemetryClient),
  )

  router.use('/absence-type', AbsenceTypeRoutes(services))
  router.use('/absence-subtype', AbsenceSubTypeRoutes(services))
  router.use('/reason-category', ReasonCategoryRoutes(services))
  router.use('/reason', AbsenceReasonRoutes(services))
  router.use('/single-or-repeating', SingleOrRepeatingRoutes())
  router.use('/start-end-dates-and-times', StartEndDateTimeRoutes())
  router.use('/search-location', SearchLocationRoutes(services))
  router.use('/enter-location', EnterLocationRoutes())
  router.use('/accompanied-or-unaccompanied', AccompaniedOrUnaccompaniedRoutes())
  router.use('/accompanied', AccompaniedRoutes(services))
  router.use('/transport', TransportRoutes(services))
  router.use('/comments', AbsenceCommentsRoutes())
  router.use('/approval', AbsenceApprovalRoutes())
  router.use('/check-answers', AddTapCheckAnswersRoutes(services))
  router.use('/confirmation', AddAbsenceConfirmationRoutes())

  router.use('/start-end-dates', StartEndDatesRoutes())
  router.use('/repeating-pattern', RepeatingPatternRoutes())
  router.use('/multi-absences-per-day', MultiAbsencesPerDayRoutes())
  router.use('/select-days-and-times', FreeformSelectDaysRoutes())
  router.use('/check-absences', CheckPatternRoutes())
  router.use('/select-days-times-weekly', SelectDaysTimesWeeklyRoutes())
  router.use('/search-locations', SearchLocationsRoutes(services))
  router.use('/match-absences-and-locations', MatchAbsencesAndLocationsRoute())

  router.use('/enter-shift-pattern', EnterShiftPatternRoutes())
  router.use('/select-days-times-biweekly', SelectDaysTimesBiWeeklyRoutes('FIRST'))
  router.use('/select-days-times-biweekly-continued', SelectDaysTimesBiWeeklyRoutes('SECOND'))
  return router
}
