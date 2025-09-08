import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { populatePrisonerDetails, toPrisonerDetails } from '../../../middleware/populatePrisonerDetails'
import { AbsenceTypeRoutes } from './absence-type/routes'

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

  router.use('/absence-type', AbsenceTypeRoutes(services))

  return router
}
