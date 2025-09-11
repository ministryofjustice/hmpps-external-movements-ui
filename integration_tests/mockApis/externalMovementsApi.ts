import { errorStub, stubFor, successStub } from './wiremock'
import { testAbsenceTypes } from '../data/testData'

export const stubExternalMovementsPing = (httpStatus = 200) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/external-movements-api/health/ping',
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

export const stubGetAllAbsenceTypes = () =>
  successStub({
    method: 'GET',
    urlPattern: '/external-movements-api/absence-categorisation/ABSENCE_TYPE',
    response: testAbsenceTypes,
  })

export const stubGetAllAbsenceTypesError = () =>
  errorStub({
    method: 'GET',
    urlPattern: '/external-movements-api/absence-categorisation/ABSENCE_TYPE',
    httpStatus: 400,
  })
