import { errorStub, stubFor, successStub } from './wiremock'
import {
  testAbsenceReasonCategory,
  testAbsenceSubType,
  testAbsenceTypes,
  testOtherReasons,
  testRefData,
  testWorkReasons,
} from '../data/testData'

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

export const stubGetReferenceData = (domain: string) =>
  successStub({
    method: 'GET',
    urlPattern: `/external-movements-api/reference-data/${domain}`,
    response: { items: testRefData[domain as keyof typeof testRefData] || [] },
  })

export const stubGetAllAbsenceTypesError = () =>
  errorStub({
    method: 'GET',
    urlPattern: '/external-movements-api/absence-categorisation/ABSENCE_TYPE',
    httpStatus: 400,
  })

export const stubGetAbsenceCategory = (
  domain: 'ABSENCE_TYPE' | 'ABSENCE_SUB_TYPE' | 'ABSENCE_REASON_CATEGORY',
  code: string,
) => {
  let response: unknown
  switch (domain) {
    case 'ABSENCE_TYPE':
      response = testAbsenceSubType
      break
    case 'ABSENCE_SUB_TYPE':
      response = code === 'SPL' ? testOtherReasons : testAbsenceReasonCategory
      break
    case 'ABSENCE_REASON_CATEGORY':
    default:
      response = testWorkReasons
      break
  }
  return successStub({
    method: 'GET',
    urlPattern: `/external-movements-api/absence-categorisation/${domain}/${code}`,
    response,
  })
}

export const stubPostCreateTap = (prisonNumber: string) =>
  successStub({
    method: 'POST',
    urlPattern: `/external-movements-api/temporary-absence-authorisations/${prisonNumber}`,
    response: { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
  })
