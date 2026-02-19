import { RequestHandler, Response } from 'express'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export enum AuthorisedRoles {
  EXTERNAL_MOVEMENTS_TAP_RO = 'EXTERNAL_MOVEMENTS_TAP_RO', // BETA External Movements - TAP & ROTL - View only role
  EXTERNAL_MOVEMENTS_TAP_RW = 'EXTERNAL_MOVEMENTS_TAP_RW', // BETA External Movements - TAP & ROTL - Management role
}

const hasRole = (res: Response, ...roles: AuthorisedRoles[]) =>
  roles.some(role => res.locals.user.userRoles.includes(role))

export const populateUserPermissions: RequestHandler = async (_req, res, next) => {
  res.locals.user.permissions = {
    TAP: UserPermissionLevel.FORBIDDEN,
  }

  if (hasRole(res, AuthorisedRoles.EXTERNAL_MOVEMENTS_TAP_RW)) {
    res.locals.user.permissions.TAP = UserPermissionLevel.MANAGE
  } else if (hasRole(res, AuthorisedRoles.EXTERNAL_MOVEMENTS_TAP_RO)) {
    res.locals.user.permissions.TAP = UserPermissionLevel.VIEW_ONLY
  }

  return next()
}
