// This is a utility script to download a dump of the CITY, COUNTY and COUNTRY reference data solely for the purpose of auto-complete feature.
// This script downloads the address data from personal-relationships-api, which is NOT a central service that owns the address domains,
// it just happens to have a copy of the reference data from NOMIS, which is suitable for our usage.
// It should be replaced if a more appropriate source is found.

import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient, InMemoryTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { writeFileSync } from 'node:fs'
import config from '../config'
import logger from '../../logger'

type AddressReferenceData = {
  referenceCodeId: number
  groupCode: string
  code: string
  description: string
  displayOrder: number
  isActive: boolean
}

const getData = async () => {
  const restClient = new RestClient(
    'Personal Relationships API',
    config.apis.personalRelationshipsApi,
    logger,
    new AuthenticationClient(config.apis.hmppsAuth, logger, new InMemoryTokenStore()),
  )

  const city = await restClient.get<AddressReferenceData[]>({ path: `/reference-codes/group/CITY` }, asSystem())
  writeFileSync(
    './server/data/address/city.ts',
    `export const CITY = ${JSON.stringify(
      city.map(({ code, description }) => ({ code, description })),
      null,
      2,
    )}`,
  )

  const county = await restClient.get<AddressReferenceData[]>({ path: `/reference-codes/group/COUNTY` }, asSystem())
  writeFileSync(
    './server/data/address/county.ts',
    `export const COUNTY = ${JSON.stringify(
      county.map(({ code, description }) => ({ code, description })),
      null,
      2,
    )}`,
  )

  const country = await restClient.get<AddressReferenceData[]>({ path: `/reference-codes/group/COUNTRY` }, asSystem())
  writeFileSync(
    './server/data/address/country.ts',
    `export const COUNTRY = ${JSON.stringify(
      country.map(({ code, description }) => ({ code, description })),
      null,
      2,
    )}`,
  )
}

getData().then(() => logger.info('Completed downloading CITY, COUNTY and COUNTRY reference data.'))
