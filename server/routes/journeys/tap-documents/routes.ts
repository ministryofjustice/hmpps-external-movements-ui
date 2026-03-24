import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { populatePrisonerDetails, toPrisonerDetails } from '../../../middleware/populatePrisonerDetails'
import { Page } from '../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import { SelectDocumentTypeRoutes } from './select-document-type/routes'
import { SelectAbsencePlanRoutes } from './select-absence-plan/routes'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'

export const TapDocumentsRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get('/start/:prisonNumber', populatePrisonerDetails(services), (req, res) => {
    if (req.middleware?.prisonerData) {
      req.journeyData.prisonerDetails = toPrisonerDetails(req.middleware.prisonerData)

      req.journeyData.createDocumentJourney = {
        documentGroup: 'TEMPORARY_ABSENCE',
        tapHomepageUrl: res.locals.breadcrumbs.breadcrumbs.find(({ alias }) => alias === 'TAP_HOME_PAGE')?.href ?? '/',
      }
      res.redirect('../select-document-type')
    } else {
      res.notFound()
    }
  })

  get(
    '*any',
    Page.CREATE_DOCUMENTS,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
    journeyStateGuard({ '*': () => undefined }, services.telemetryClient),
  )

  router.use('/select-document-type', SelectDocumentTypeRoutes(services))
  router.use('/select-absence-plan', SelectAbsencePlanRoutes(services))

  return router
}
