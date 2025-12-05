import { Router } from 'express'
import { Services } from '../../services'
import setUpJourneyData from '../../middleware/journey/setUpJourneyData'
import { mergeObjects } from '../../utils/utils'
import { AddTemporaryAbsenceRoutes } from './add-temporary-absence/routes'
import { ManageTemporaryAbsenceRoutes } from './temporary-absences/routes'
import { ManageTapAuthorisationRoutes } from './temporary-absence-authorisations/routes'
import { requirePermissions } from '../../middleware/permissions/requirePermissions'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export const JourneyRoutes = (services: Services) => {
  const router = Router({ mergeParams: true })

  router.use(setUpJourneyData(services.cacheStore('journey')))

  router.get('*any', (req, res, next) => {
    if (req.journeyData.prisonerDetails) {
      res.locals.prisonerDetails = req.journeyData.prisonerDetails
    }
    next()
  })

  router.use(
    '/add-temporary-absence',
    requirePermissions('TAP', UserPermissionLevel.MANAGE),
    AddTemporaryAbsenceRoutes(services),
  )
  router.use(
    '/temporary-absences',
    requirePermissions('TAP', UserPermissionLevel.MANAGE),
    ManageTemporaryAbsenceRoutes(services),
  )
  router.use(
    '/temporary-absence-authorisations',
    requirePermissions('TAP', UserPermissionLevel.MANAGE),
    ManageTapAuthorisationRoutes(services),
  )

  if (process.env.NODE_ENV === 'e2e-test') {
    router.get('/inject-journey-data', (req, res) => {
      const { data } = req.query
      const json = JSON.parse(atob(data as string))
      mergeObjects(req.journeyData, json)
      res.sendStatus(200)
    })
  }

  return router
}
