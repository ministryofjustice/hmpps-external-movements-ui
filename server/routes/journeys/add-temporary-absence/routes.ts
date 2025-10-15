import { Request } from 'express'
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
import { AddTapCheckAnswersRoutes } from './check-answers/routes'
import { AccompaniedOrUnaccompaniedRoutes } from './accompanied-or-unaccompanied/routes'
import { AccompaniedRoutes } from './accompanied/routes'
import { TransportRoutes } from './transport/routes'
import { AbsenceCommentsRoutes } from './comments/routes'
import { AbsenceApprovalRoutes } from './approval/routes'
import { AddAbsenceConfirmationRoutes } from './confirmation/routes'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'
import { AddTemporaryAbsenceJourney } from '../../../@types/journeys'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import { StartEndDatesRoutes } from './start-end-dates/routes'
import { RepeatingPatternRoutes } from './repeating-pattern/routes'
import { FreeformSelectDaysRoutes } from './select-days-and-times/routes'
import { CheckPatternRoutes } from './check-absences/routes'
import { SearchLocationRoutes } from './search-location/routes'
import { ConfirmLocationRoutes } from './confirm-location/routes'
import { EnterLocationRoutes } from './enter-location/routes'

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
  router.use('/start-date', StartDateRoutes())
  router.use('/end-date', EndDateRoutes())
  router.use('/search-location', SearchLocationRoutes(services))
  router.use('/enter-location', EnterLocationRoutes(services))
  router.use('/confirm-location', ConfirmLocationRoutes())
  router.use('/accompanied-or-unaccompanied', AccompaniedOrUnaccompaniedRoutes())
  router.use('/accompanied', AccompaniedRoutes(services))
  router.use('/transport', TransportRoutes(services))
  router.use('/comments', AbsenceCommentsRoutes())
  router.use('/approval', AbsenceApprovalRoutes())
  router.use('/check-answers', AddTapCheckAnswersRoutes(services))
  router.use('/confirmation', AddAbsenceConfirmationRoutes())

  router.use('/start-end-dates', StartEndDatesRoutes())
  router.use('/repeating-pattern', RepeatingPatternRoutes())
  router.use('/select-days-and-times', FreeformSelectDaysRoutes())
  router.use('/check-absences', CheckPatternRoutes())

  return router
}

const get = (req: Request, category: string, key: keyof AddTemporaryAbsenceJourney) => {
  // @ts-expect-error category is known
  return req.journeyData.addTemporaryAbsence?.[category]?.[key] || req.journeyData.addTemporaryAbsence?.[key]
}

const guard = {
  'absence-type': () => undefined,
  'absence-subtype': (req: Request) => {
    const type = get(req, 'categorySubJourney', 'absenceType')
    if (type?.nextDomain === 'ABSENCE_SUB_TYPE') return undefined
    return '/absence-type'
  },
  reason: (req: Request) => {
    const type = get(req, 'categorySubJourney', 'absenceType')
    if (!type) return '/absence-type'
    const subtype = get(req, 'categorySubJourney', 'absenceSubType')
    const reasonCategory = get(req, 'categorySubJourney', 'reasonCategory')

    const nextDomains = [type.nextDomain, subtype?.nextDomain, reasonCategory?.nextDomain]

    // If no next domains are reason - then disallow access to this page
    if (!nextDomains.find(domain => domain === 'ABSENCE_REASON')) return '/reason-category'

    if (type.nextDomain === 'ABSENCE_REASON') return undefined
    if (type.nextDomain === 'ABSENCE_SUB_TYPE') {
      if (subtype?.nextDomain === 'ABSENCE_REASON') return undefined
      if (subtype?.nextDomain === 'ABSENCE_REASON_CATEGORY') {
        return reasonCategory ? undefined : '/reason-category'
      }

      return subtype ? undefined : '/absence-subtype'
    }

    // This is sort of undefined behaviour, just let them do it
    return undefined
  },
  'reason-category': (req: Request) => {
    const subtype = get(req, 'categorySubJourney', 'absenceSubType')
    return subtype?.nextDomain === 'ABSENCE_REASON_CATEGORY' ? undefined : '/absence-subtype'
  },
  'single-or-repeating': (req: Request) => {
    const type = get(req, 'categorySubJourney', 'absenceType')
    if (!type) return '/absence-type'
    const subtype = get(req, 'categorySubJourney', 'absenceSubType')
    const reasonCategory = get(req, 'categorySubJourney', 'reasonCategory')
    const reason = get(req, 'categorySubJourney', 'reason')

    if (!type.nextDomain) return undefined
    if (reason && !reason.nextDomain) return undefined
    if (reasonCategory && !reasonCategory.nextDomain) return undefined
    if (subtype && !subtype.nextDomain) return undefined

    // One of the requirements was not met - bounce back to reason and let that figure out where to go
    return '/reason'
  },
  'start-date': (req: Request) => (get(req, '', 'repeat') === undefined ? '/single-or-repeating' : undefined),
  'end-date': (req: Request) => (get(req, 'startDateTimeSubJourney', 'startDate') ? undefined : '/start-date'),
  'search-location': (req: Request) => (get(req, '', 'returnDate') ? undefined : '/end-date'),
  'enter-location': (req: Request) => (get(req, '', 'returnDate') ? undefined : '/end-date'),
  'confirm-location': (req: Request) =>
    get(req, 'confirmLocationSubJourney', 'location') ? undefined : '/search-location',
  'accompanied-or-unaccompanied': (req: Request) => (get(req, '', 'location') ? undefined : '/search-location'),
  accompanied: (req: Request) =>
    get(req, 'accompaniedSubJourney', 'accompanied') ? undefined : '/accompanied-or-unaccompanied',
  transport: (req: Request) => {
    if (get(req, 'accompaniedSubJourney', 'accompanied')) {
      return get(req, 'accompaniedSubJourney', 'accompaniedBy') ? undefined : '/accompanied'
    }

    return get(req, 'accompaniedSubJourney', 'accompanied') === false ? undefined : '/accompanied-or-unaccompanied'
  },
  comments: (req: Request) => (get(req, '', 'transport') ? undefined : '/transport'),
  approval: (req: Request) => (get(req, '', 'notes') !== undefined ? undefined : '/comments'),
  'check-answers': (req: Request) => (get(req, '', 'requireApproval') !== undefined ? undefined : '/approval'),
  confirmation: (req: Request) => (req.journeyData.journeyCompleted ? undefined : '/check-answers'),
}
