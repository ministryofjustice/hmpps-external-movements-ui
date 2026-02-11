import { Request } from 'express'
import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { createBackUrlFor } from '../../../middleware/history/historyMiddleware'
import { EditTapOccurrenceRoutes } from './edit/routes'
import { isTapOccurrenceEditable } from '../../../utils/utils'

export const ManageTemporaryAbsenceRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get('/start-edit/:occurrenceId/:property', async (req: Request<{ occurrenceId: string; property: string }>, res) => {
    try {
      const occurrence = await services.externalMovementsService.getTapOccurrence({ res }, req.params.occurrenceId)

      if (!isTapOccurrenceEditable(occurrence)) {
        res.conflict()
        return
      }

      const authorisation = await services.externalMovementsService.getTapAuthorisation(
        { res },
        occurrence.authorisation.id,
      )
      req.journeyData.updateTapOccurrence = {
        occurrence,
        authorisation,
        backUrl: createBackUrlFor(
          res,
          /temporary-absences\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
          `/temporary-absences/${occurrence.id}`,
        ),
      }
      req.journeyData.prisonerDetails = await services.prisonerSearchService.getPrisonerDetails(
        { res },
        authorisation.person.personIdentifier,
      )
      res.redirect(`../../edit/${req.params.property}`)
    } catch {
      res.notFound()
    }
  })

  router.use('/edit', EditTapOccurrenceRoutes(services))

  return router
}
