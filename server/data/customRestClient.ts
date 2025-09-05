import { Response } from 'express'
import Logger from 'bunyan'
import { Response as SuperAgentResponse } from 'superagent'
import { AgentConfig, asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'

interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

interface ApiRequest {
  path: string
  query?: object | string
  headers?: Record<string, string>
  retries?: number
  retryHandler?: (retry?: boolean) => (err: Error, res: SuperAgentResponse) => boolean | undefined
}

interface ApiRequestWithBody extends ApiRequest {
  data?: Record<string, unknown> | string | Array<unknown> | undefined
  retry?: boolean
}

export type ApiRequestContext = {
  res: Response
  readOnly?: boolean
}

export default class CustomRestClient extends RestClient {
  constructor(
    name: string,
    config: ApiConfig,
    logger: Logger | Console,
    authenticationClient?: AuthenticationClient | undefined,
    private readonly audited: boolean = false,
    private readonly retryHandler:
      | ((retry?: boolean) => (err: Error, res: SuperAgentResponse) => boolean | undefined)
      | undefined = undefined,
  ) {
    super(name, config, logger, authenticationClient)
  }

  handleApiRequest(apiRequest: ApiRequest, res: Response) {
    const headers: { [key: string]: string } = {}
    if (res?.locals?.user?.activeCaseLoad?.caseLoadId) {
      headers['CaseloadId'] = res.locals.user.activeCaseLoad.caseLoadId
    }

    return {
      ...apiRequest,
      headers,
      ...(this.retryHandler ? { retryHandler: this.retryHandler } : {}),
    }
  }

  sendAuditEvent(apiUrl: string, res: Response, isAttempt: boolean) {
    if (!this.audited) return
    if (!res.sendApiEvent) throw new Error(`Missing audit event handler for ${apiUrl}`)
    res.sendApiEvent(apiUrl, isAttempt)
  }

  withContext({ res, readOnly }: ApiRequestContext) {
    return {
      get: async <T>(apiRequest: ApiRequest) => {
        return (await super.get(this.handleApiRequest(apiRequest, res), asSystem(res.locals.user.username))) as T
      },
      patch: async <T>(apiRequest: ApiRequestWithBody) => {
        this.sendAuditEvent(`PATCH ${apiRequest.path}`, res, true)
        const result = (await super.patch(
          this.handleApiRequest(apiRequest, res),
          asSystem(res.locals.user.username),
        )) as T
        this.sendAuditEvent(`PATCH ${apiRequest.path}`, res, false)
        return result
      },
      put: async <T>(apiRequest: ApiRequestWithBody) => {
        this.sendAuditEvent(`PUT ${apiRequest.path}`, res, true)
        const result = (await super.put(
          this.handleApiRequest(apiRequest, res),
          asSystem(res.locals.user.username),
        )) as T
        this.sendAuditEvent(`PUT ${apiRequest.path}`, res, false)
        return result
      },
      post: async <T>(apiRequest: ApiRequestWithBody) => {
        if (!readOnly) this.sendAuditEvent(`POST ${apiRequest.path}`, res, true)
        const result = (await super.post(
          this.handleApiRequest(apiRequest, res),
          asSystem(res.locals.user.username),
        )) as T
        if (!readOnly) this.sendAuditEvent(`POST ${apiRequest.path}`, res, false)
        return result
      },
      delete: async <T>(apiRequest: ApiRequest) => {
        this.sendAuditEvent(`DELETE ${apiRequest.path}`, res, true)
        const result = (await super.delete(
          this.handleApiRequest(apiRequest, res),
          asSystem(res.locals.user.username),
        )) as T
        this.sendAuditEvent(`DELETE ${apiRequest.path}`, res, false)
        return result
      },
    }
  }
}
