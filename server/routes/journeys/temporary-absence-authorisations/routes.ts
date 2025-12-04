import { Request } from 'express'
import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { EditTapAuthorisationRoutes } from './edit/routes'
import { createBackUrlFor } from '../../../middleware/history/historyMiddleware'
import { AddTapOccurrenceRoutes } from './add-occurrence/routes'

export const ManageTapAuthorisationRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get(
    '/start-edit/:authorisationId/:property',
    async (req: Request<{ authorisationId: string; property: string }>, res) => {
      try {
        const authorisation = await services.externalMovementsService.getTapAuthorisation(
          { res },
          req.params.authorisationId,
        )
        req.journeyData.updateTapAuthorisation = {
          authorisation,
          backUrl: createBackUrlFor(
            res,
            /temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
            `/temporary-absence-authorisations/${authorisation.id}`,
          ),
        }
        req.journeyData.prisonerDetails = {
          prisonerNumber: authorisation.person.personIdentifier,
          lastName: authorisation.person.lastName,
          firstName: authorisation.person.firstName,
          dateOfBirth: authorisation.person.dateOfBirth,
          prisonName: res.locals.user.activeCaseLoad?.description,
          cellLocation: authorisation.person.cellLocation,
        }
        res.redirect(`../../edit/${req.params.property}`)
      } catch {
        res.notFound()
      }
    },
  )

  get(
    '/start-add-occurrence/:authorisationId',
    async (req: Request<{ authorisationId: string; property: string }>, res) => {
      try {
        const authorisation = await services.externalMovementsService.getTapAuthorisation(
          { res },
          req.params.authorisationId,
        )
        req.journeyData.addTapOccurrence = {
          authorisation,
          backUrl: createBackUrlFor(
            res,
            /(temporary-absence-authorisations|temporary-absences)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
            `/temporary-absence-authorisations/${authorisation.id}`,
          ),
        }
        req.journeyData.prisonerDetails = {
          prisonerNumber: authorisation.person.personIdentifier,
          lastName: authorisation.person.lastName,
          firstName: authorisation.person.firstName,
          dateOfBirth: authorisation.person.dateOfBirth,
          prisonName: res.locals.user.activeCaseLoad?.description,
          cellLocation: authorisation.person.cellLocation,
        }
        res.redirect(`../add-occurrence`)
      } catch {
        res.notFound()
      }
    },
  )

  router.use('/edit', EditTapAuthorisationRoutes(services))
  router.use('/add-occurrence', AddTapOccurrenceRoutes(services))

  return router
}
