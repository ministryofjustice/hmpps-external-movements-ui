/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
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
  addressToLines,
  firstNameSpaceLastName,
  formatRefDataName,
  lastNameCommaFirstName,
  occurrenceStatus,
  statusPriority,
} from './formatUtils'
import {
  formatDate,
  formatInputDate,
  formatTime,
  inputDate,
  addDaysMonths,
  parseDatePickerMaxDate,
  parseDatePickerMinDate,
  todayStringGBFormat,
  yesterdayStringGBFormat,
} from './dateTimeUtils'
import {
  buildErrorSummaryList,
  customErrorOrderBuilder,
  findError,
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

  njkEnv.addGlobal('todayStringGBFormat', todayStringGBFormat)
  njkEnv.addGlobal('yesterdayStringGBFormat', yesterdayStringGBFormat)
  njkEnv.addGlobal('inputDate', inputDate)

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
  njkEnv.addFilter('firstNameSpaceLastName', firstNameSpaceLastName)
  njkEnv.addFilter('lastNameCommaFirstName', lastNameCommaFirstName)
  njkEnv.addFilter('formatRefDataName', formatRefDataName)
  njkEnv.addFilter('getQueryEntries', getQueryEntries)
  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('formatTime', formatTime)
  njkEnv.addFilter('formatInputDate', formatInputDate)
  njkEnv.addFilter('parseDatePickerMinDate', parseDatePickerMinDate)
  njkEnv.addFilter('parseDatePickerMaxDate', parseDatePickerMaxDate)
  njkEnv.addFilter('addDaysMonths', addDaysMonths)
  njkEnv.addFilter('findError', findError)
  njkEnv.addFilter('buildErrorSummaryList', buildErrorSummaryList)
  njkEnv.addFilter('customErrorOrderBuilder', customErrorOrderBuilder)
  njkEnv.addFilter('addSelectValue', addSelectValue)
  njkEnv.addFilter('setSelectedValue', setSelectedValue)
  njkEnv.addFilter('setCheckedValue', setCheckedValue)
  njkEnv.addFilter('removeNullish', arr => arr.filter(Boolean))
  njkEnv.addFilter('addressToLines', addressToLines)
  njkEnv.addFilter('fromRefData', fromRefData)
  njkEnv.addFilter('statusPriority', statusPriority)
  njkEnv.addFilter('occurrenceStatus', occurrenceStatus)
  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('contains', (arr, value) => arr.includes(value))
}
