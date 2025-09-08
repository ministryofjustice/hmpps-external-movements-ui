import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import Prisoner from '../services/prisonerSearch/prisoner'
import { PrisonerDetails } from '../@types/journeys'
import { Services } from '../services'

export const populatePrisonerDetails = ({ prisonPermissionsService }: Services) =>
  prisonerPermissionsGuard(prisonPermissionsService, {
    requestDependentOn: [PrisonerBasePermission.read],
    getPrisonerNumberFunction: req => req.params['prisonNumber'] as string,
  })

export const toPrisonerDetails = (prisoner: Prisoner): PrisonerDetails => ({
  prisonerNumber: prisoner.prisonerNumber,
  lastName: prisoner.lastName,
  firstName: prisoner.firstName,
  dateOfBirth: prisoner.dateOfBirth,
  prisonName: prisoner.prisonName,
  cellLocation: prisoner.cellLocation,
})
