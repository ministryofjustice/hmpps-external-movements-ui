import { RequestHandler } from 'express'
import { isGranted, PermissionsService, PrisonerMovesPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { HmppsUser } from '@ministryofjustice/hmpps-prison-permissions-lib/dist/types/internal/user/HmppsUser'
import Prisoner from '@ministryofjustice/hmpps-prison-permissions-lib/dist/data/hmppsPrisonerSearch/interfaces/Prisoner'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export enum AuthorisedRoles {
  EXTERNAL_MOVEMENTS_TAP_RO = 'EXTERNAL_MOVEMENTS_TAP_RO', // BETA External Movements - TAP & ROTL - View only role
  EXTERNAL_MOVEMENTS_TAP_RW = 'EXTERNAL_MOVEMENTS_TAP_RW', // BETA External Movements - TAP & ROTL - Management role
}

export const populateUserPermissions =
  (prisonPermissionsService: PermissionsService): RequestHandler =>
  async (_req, res, next) => {
    const prisonPermission = prisonPermissionsService.getPrisonerPermissions({
      user: res.locals.user as HmppsUser,
      prisoner: { prisonId: res.locals.user.getActiveCaseloadId() } as Prisoner,
      requestDependentOn: [],
    })

    res.locals.user.permissions = {
      TAP: UserPermissionLevel.FORBIDDEN,
    }

    if (isGranted(PrisonerMovesPermission.edit_temporary_absence, prisonPermission)) {
      res.locals.user.permissions.TAP = UserPermissionLevel.MANAGE
    } else if (isGranted(PrisonerMovesPermission.read_temporary_absence, prisonPermission)) {
      res.locals.user.permissions.TAP = UserPermissionLevel.VIEW_ONLY
    }

    return next()
  }
