import superagent, { type SuperAgentRequest, type Response } from 'superagent'

const adminUrl = 'http://localhost:9091/__admin'

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${adminUrl}/mappings`).send(mapping)

const successStub = ({
  method,
  urlPattern,
  url,
  response,
}: {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  urlPattern?: string
  url?: string
  response: unknown
}) =>
  stubFor({
    request: {
      method,
      ...(url ? { url } : {}),
      ...(urlPattern ? { urlPattern } : {}),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const errorStub = ({
  method,
  urlPattern,
  httpStatus,
}: {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  urlPattern: string
  httpStatus: number
}) =>
  stubFor({
    request: {
      method,
      urlPattern,
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { userMessage: 'Stubbed API error returned' },
    },
  })

const getMatchingRequests = (body?: string | object) => superagent.post(`${adminUrl}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${adminUrl}/mappings`), superagent.delete(`${adminUrl}/requests`)])

const getSentAuditEvents = async (): Promise<object[]> => {
  const wiremockApiResponse: Response = await superagent
    .post(`${adminUrl}/requests/find`)
    .send({ method: 'POST', urlPath: '/' })

  return (wiremockApiResponse.body || '[]').requests.map((itm: { body?: string }) => {
    if (!itm.body || !itm.body.includes('MessageBody')) {
      return undefined
    }
    return JSON.parse(JSON.parse(itm.body)['MessageBody'])
  })
}

const getApiBody = async (urlPattern: string, method: string = 'POST'): Promise<object[]> => {
  const wiremockApiResponse: Response = await superagent.post(`${adminUrl}/requests/find`).send({ method, urlPattern })

  return (wiremockApiResponse.body || '[]').requests.map((itm: { body?: string }) => {
    return itm.body ? JSON.parse(itm.body) : undefined
  })
}

export { stubFor, getMatchingRequests, resetStubs, successStub, errorStub, getSentAuditEvents, getApiBody }
