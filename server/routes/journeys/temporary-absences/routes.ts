import { Request } from 'express'
import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { Page } from '../../../services/auditService'

import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import { EditTapOccurrenceRoutes } from './edit/routes'

export const ManageTemporaryAbsenceRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get('/start-edit/:occurrenceId', async (req: Request<{ occurrenceId: string }>, res) => {
    try {
      const occurrence = await services.externalMovementsService.getTapOccurrence({ res }, req.params.occurrenceId)
      const authorisation = await services.externalMovementsService.getTapAuthorisation(
        { res },
        occurrence.authorisation.id,
      )
      req.journeyData.updateTapOccurrence = { occurrence, authorisation }
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
    Page.EDIT_TEMPORARY_ABSENCE,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
  )

  router.use('/edit', EditTapOccurrenceRoutes(services))

  return router
}
