import { Request } from 'express'
import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { Page } from '../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import { EditTapAuthorisationRoutes } from './edit/routes'

export const ManageTapAuthorisationRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get('/start-edit/:authorisationId', async (req: Request<{ authorisationId: string }>, res) => {
    try {
      const authorisation = await services.externalMovementsService.getTapAuthorisation(
        { res },
        req.params.authorisationId,
      )
      req.journeyData.updateTapAuthorisation = { authorisation }
      req.journeyData.prisonerDetails = {
        prisonerNumber: authorisation.person.personIdentifier,
        lastName: authorisation.person.lastName,
        firstName: authorisation.person.firstName,
        dateOfBirth: authorisation.person.dateOfBirth,
        prisonName: res.locals.user.activeCaseLoad?.description,
        cellLocation: authorisation.person.cellLocation,
      }
      res.redirect('../edit')
    } catch {
      res.notFound()
    }
  })

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

  router.use('/edit', EditTapAuthorisationRoutes(services))

  return router
}
