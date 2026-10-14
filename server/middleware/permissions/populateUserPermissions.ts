import { RequestHandler, Response } from 'express'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export enum AuthorisedRoles {
  EXTERNAL_MOVEMENTS_TAP_RO = 'EXTERNAL_MOVEMENTS_TAP_RO', // BETA External Movements - TAP & ROTL - View only role
  EXTERNAL_MOVEMENTS_TAP_RW = 'EXTERNAL_MOVEMENTS_TAP_RW', // BETA External Movements - TAP & ROTL - Management role
  TRANSFER_SCHEDULER_RO = 'TRANSFER_SCHEDULER_RO',
  TRANSFER_SCHEDULER_RW = 'TRANSFER_SCHEDULER_RW',
  RELEASE_SCHEDULER_RO = 'RELEASE_SCHEDULER_RO',
  RELEASE_SCHEDULER_RW = 'RELEASE_SCHEDULER_RW',
}

export const hasRole = (res: Response, ...roles: AuthorisedRoles[]) =>
  roles.some(role => res.locals.user.userRoles.includes(role))

export const populateUserPermissions: RequestHandler = async (_req, res, next) => {
  res.locals.user.permissions = {
    TAP: UserPermissionLevel.FORBIDDEN,
    Transfer: UserPermissionLevel.FORBIDDEN,
    Release: UserPermissionLevel.FORBIDDEN,
  }

  if (hasRole(res, AuthorisedRoles.EXTERNAL_MOVEMENTS_TAP_RW)) {
    res.locals.user.permissions.TAP = UserPermissionLevel.MANAGE
  } else if (hasRole(res, AuthorisedRoles.EXTERNAL_MOVEMENTS_TAP_RO)) {
    res.locals.user.permissions.TAP = UserPermissionLevel.VIEW_ONLY
  }

  if (res.locals.feComponents?.sharedData?.services.find(({ id }) => id === 'transfer-scheduler')) {
    if (hasRole(res, AuthorisedRoles.TRANSFER_SCHEDULER_RW)) {
      res.locals.user.permissions.Transfer = UserPermissionLevel.MANAGE
    } else if (hasRole(res, AuthorisedRoles.TRANSFER_SCHEDULER_RO)) {
      res.locals.user.permissions.Transfer = UserPermissionLevel.VIEW_ONLY
    }
  }

  if (res.locals.feComponents?.sharedData?.services.find(({ id }) => id === 'release-scheduler')) {
    if (hasRole(res, AuthorisedRoles.RELEASE_SCHEDULER_RW)) {
      res.locals.user.permissions.Release = UserPermissionLevel.MANAGE
    } else if (hasRole(res, AuthorisedRoles.RELEASE_SCHEDULER_RO)) {
      res.locals.user.permissions.Release = UserPermissionLevel.VIEW_ONLY
    }
  }

  return next()
}
