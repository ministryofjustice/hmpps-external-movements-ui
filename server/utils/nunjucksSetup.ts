/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
// @ts-expect-error no type for Moj frontend filters
import MojFilter from '@ministryofjustice/frontend/moj/filters/all'
import {
  addSelectValue,
  fromRefData,
  getQueryEntries,
  initialiseName,
  setCheckedValue,
  setSelectedValue,
} from './utils'
import config from '../config'
import logger from '../../logger'
import {
  firstNameSpaceLastName,
  formatRefDataName,
  joinAddress,
  lastNameCommaFirstName,
  occurrenceStatus,
  possessiveComma,
  statusPriority,
} from './formatUtils'
import { formatDate, formatInputDate, formatTime, inputDate, addDaysMonths, absenceTimeRange } from './dateTimeUtils'
import {
  buildErrorSummaryList,
  customErrorOrderBuilder,
  findError,
  findErrorMessage,
} from '../middleware/validation/validationMiddleware'
import { historyExtension } from '../middleware/history/historyExtension'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'HMPPS External Movements'
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  app.use((_req, res, next) => {
    res.locals.digitalPrisonServicesUrl = config.serviceUrls.digitalPrison
    res.locals.prisonerProfileUrl = config.serviceUrls.prisonerProfile
    return next()
  })

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      path.join(__dirname, '../../server/routes/journeys'),
      path.join(__dirname, '../../server/routes'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-shared-items/dist/assets/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  njkEnv.addExtension('HistoryExtension', historyExtension)

  njkEnv.addGlobal('inputDate', inputDate)

  const { date, mojDate } = MojFilter()
  njkEnv.addFilter('date', date)
  njkEnv.addFilter('mojDate', mojDate)

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
  njkEnv.addFilter('firstNameSpaceLastName', firstNameSpaceLastName)
  njkEnv.addFilter('lastNameCommaFirstName', lastNameCommaFirstName)
  njkEnv.addFilter('possessiveComma', possessiveComma)
  njkEnv.addFilter('formatRefDataName', formatRefDataName)
  njkEnv.addFilter('getQueryEntries', getQueryEntries)
  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('formatTime', formatTime)
  njkEnv.addFilter('formatInputDate', formatInputDate)
  njkEnv.addFilter('addDaysMonths', addDaysMonths)
  njkEnv.addFilter('absenceTimeRange', absenceTimeRange)
  njkEnv.addFilter('findError', findError)
  njkEnv.addFilter('findErrorMessage', findErrorMessage)
  njkEnv.addFilter('buildErrorSummaryList', buildErrorSummaryList)
  njkEnv.addFilter('customErrorOrderBuilder', customErrorOrderBuilder)
  njkEnv.addFilter('addSelectValue', addSelectValue)
  njkEnv.addFilter('setSelectedValue', setSelectedValue)
  njkEnv.addFilter('setCheckedValue', setCheckedValue)
  njkEnv.addFilter('removeNullish', arr => arr.filter(Boolean))
  njkEnv.addFilter('fromRefData', fromRefData)
  njkEnv.addFilter('statusPriority', statusPriority)
  njkEnv.addFilter('occurrenceStatus', occurrenceStatus)
  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('contains', (arr, value) => arr.includes(value))
  njkEnv.addFilter('joinAddress', joinAddress)
}
