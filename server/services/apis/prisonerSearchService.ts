import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { HmppsUser } from '@ministryofjustice/hmpps-prison-permissions-lib/dist/types/internal/user/HmppsUser'
import Prisoner from './model/prisoner'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { isPrisonNumber } from '../../utils/utils'

export default class PrisonerSearchApiService {
  private prisonerSearchApiClient: CustomRestClient

  constructor(
    authenticationClient: AuthenticationClient,
    private readonly prisonPermissionsService: PermissionsService,
  ) {
    this.prisonerSearchApiClient = new CustomRestClient(
      'Prison Offender Search API',
      config.apis.prisonerSearchApi,
      logger,
      authenticationClient,
      false,
      (retry?: boolean) => (err: Error, res: SuperAgentResponse) => {
        if (!retry) return false
        if (err) return true
        if (res?.statusCode) {
          return res.statusCode >= 500
        }
        return undefined
      },
    )
  }

  async getPrisonerDetails(context: ApiRequestContext, prisonerNumber: string): Promise<Prisoner> {
    const prisoner = await this.prisonerSearchApiClient
      .withContext(context)
      .get<Prisoner>({ path: `/prisoner/${prisonerNumber}` })

    const permission = this.prisonPermissionsService.getPrisonerPermissions({
      user: context.res.locals.user as HmppsUser,
      prisoner,
      requestDependentOn: [],
    })

    if (permission['prisoner:base-record:read']) return prisoner

    return {
      ...prisoner,
      prisonName: '',
      cellLocation: '',
      dateOfBirth: '',
    }
  }

  async searchPrisoner(context: ApiRequestContext, searchTerm: string): Promise<Prisoner[]> {
    return (
      await this.prisonerSearchApiClient.withContext(context).get<{ content: Prisoner[] }>({
        path: `/prison/${context.res.locals.user.getActiveCaseloadId()}/prisoners?size=10&term=${encodeURIComponent(searchTerm)}`,
      })
    ).content
  }

  async globalSearchPrisoner(context: ApiRequestContext, searchTerm: string): Promise<Prisoner[]> {
    const request: { [key: string]: string } = {}
    if (isPrisonNumber(searchTerm)) {
      request['prisonerIdentifier'] = searchTerm.trim().toUpperCase()
    } else {
      const [firstName, lastName] = searchTerm.split(/\s+/)
      if (firstName) request['firstName'] = firstName
      if (lastName) request['lastName'] = lastName
    }

    return (
      await this.prisonerSearchApiClient.withContext(context).post<{ content: Prisoner[] }>({
        path: '/global-search?size=10',
        data: request,
      })
    ).content.filter(
      prisoner =>
        this.prisonPermissionsService.getPrisonerPermissions({
          user: context.res.locals.user as HmppsUser,
          prisoner,
          requestDependentOn: [],
        })['prisoner:base-record:read'],
    )
  }
}
