import { OsAddress } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { successStub } from './wiremock'

export const stubSearchAddresses = (query: string, addresses: OsAddress[]) =>
  successStub({
    method: 'GET',
    url: `/os-places-api/find?query=${query}&key=apikey&lr=EN&fq=LOGICAL_STATUS_CODE%3A1&fq=LPI_LOGICAL_STATUS_CODE%3A1&dataset=LPI`,
    response: {
      results: addresses.map(parseAddress),
    },
  })

export const stubGetAddress = (uprn: string, address: OsAddress) =>
  successStub({
    method: 'GET',
    url: `/os-places-api/uprn?uprn=${uprn}&key=apikey&dataset=LPI`,
    response: {
      results: [parseAddress(address)],
    },
  })

const parseAddress = (address: OsAddress) => ({
  DPA: {
    UPRN: address.uprn,
    ADDRESS: address.addressString,
    ...(address.buildingNumber ? { BUILDING_NUMBER: address.buildingNumber } : {}),
    BUILDING_NAME: address.buildingName,
    SUB_BUILDING_NAME: address.subBuildingName,
    THOROUGHFARE_NAME: address.thoroughfareName,
    DEPENDENT_LOCALITY: address.dependentLocality,
    POST_TOWN: address.postTown,
    POSTCODE: address.postcode,
    COUNTRY_CODE: address.country,
  },
})
