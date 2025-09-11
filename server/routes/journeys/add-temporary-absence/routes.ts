import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { populatePrisonerDetails, toPrisonerDetails } from '../../../middleware/populatePrisonerDetails'
import { AbsenceTypeRoutes } from './absence-type/routes'
import redirectCheckAnswersMiddleware from '../../../middleware/journey/redirectCheckAnswersMiddleware'
import { Page } from '../../../services/auditService'
import { AbsenceSubTypeRoutes } from './absence-subtype/routes'
import { ReasonCategoryRoutes } from './reason-category/routes'
import { AbsenceReasonRoutes } from './reason/routes'

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

  router.use(redirectCheckAnswersMiddleware([/absence-type/, /absence-subtype/, /reason/, /check-answers$/]))

  router.use('/absence-type', AbsenceTypeRoutes(services))
  router.use('/absence-subtype', AbsenceSubTypeRoutes(services))
  router.use('/reason-category', ReasonCategoryRoutes(services))
  router.use('/reason', AbsenceReasonRoutes(services))

  return router
}
