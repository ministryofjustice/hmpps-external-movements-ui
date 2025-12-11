import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../../integration_tests/steps/signIn'
import {
  randomPrisonNumber,
  testTapAuthorisation,
  testTapOccurrence,
} from '../../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import {
  stubGetTapAuthorisation,
  stubGetTapOccurrence,
  stubPutTapOccurrence,
} from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTapOccurrenceStartEndDatesPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/temporary-absences/edit/start-end-dates', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, `/${uuidV4()}/temporary-absences/edit/start-end-dates`)
  })
})

test.describe('/temporary-absences/edit/start-end-dates', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()
  const occurrenceId = uuidV4()

  const authorisation = {
    ...testTapAuthorisation,
    id: authorisationId,
    repeat: true,
    start: '2001-01-02',
    end: '2001-01-05',
    occurrences: [
      {
        id: 'occurrence-id-1',
        status: { code: 'PENDING', description: 'To be reviewed' },
        start: '2001-01-02T10:00:00',
        end: '2001-01-02T17:30:00',
        location: { uprn: 1001, description: 'Random Street, UK' },
        accompaniedBy: { code: 'U', description: 'Unaccompanied' },
        transport: { code: 'CAR', description: 'Car' },
      },
    ],
  }

  const occurrence = {
    ...testTapOccurrence,
    id: occurrenceId,
    authorisation,
    status: { code: 'SCHEDULED', description: 'Scheduled' },
    start: '2001-01-03T10:00:00',
    end: '2001-01-03T17:30:00',
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
      stubGetTapOccurrence(occurrence),
      stubPutTapOccurrence(occurrenceId, {
        content: [
          {
            user: { username: 'USERNAME', name: 'User Name' },
            occurredAt: '2025-12-01T17:50:20.421301',
            domainEvents: ['person.temporary-absence.rescheduled'],
            changes: [{ propertyName: '', previous: '', change: '' }],
          },
        ],
      }),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absences/start-edit/${occurrenceId}/start-end-dates`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new EditTapOccurrenceStartEndDatesPage(page).verifyContent()

    await expect(testPage.startDateField()).toBeVisible()
    await expect(testPage.startDateField()).toHaveValue('3/1/2001')
    await expect(testPage.startHourField()).toBeVisible()
    await expect(testPage.startHourField()).toHaveValue('10')
    await expect(testPage.startMinuteField()).toBeVisible()
    await expect(testPage.startMinuteField()).toHaveValue('00')
    await expect(testPage.endDateField()).toBeVisible()
    await expect(testPage.endDateField()).toHaveValue('3/1/2001')
    await expect(testPage.endHourField()).toBeVisible()
    await expect(testPage.endHourField()).toHaveValue('17')
    await expect(testPage.endMinuteField()).toBeVisible()
    await expect(testPage.endMinuteField()).toHaveValue('30')
    await expect(testPage.button('Confirm and save')).toBeVisible()

    // verify validation error
    await testPage.startDateField().clear()
    await testPage.startHourField().clear()
    await testPage.startMinuteField().clear()
    await testPage.endDateField().clear()
    await testPage.endHourField().clear()
    await testPage.endMinuteField().clear()
    await testPage.clickButton('Confirm and save')
    await testPage.link('Enter or select a start date').click()
    await expect(testPage.startDateField()).toBeFocused()
    await testPage.link('Enter or select a return date').click()
    await expect(testPage.endDateField()).toBeFocused()
    await testPage.link('Enter a start time').click()
    await expect(testPage.startHourField()).toBeFocused()
    await testPage.link('Enter a return time').click()
    await expect(testPage.endHourField()).toBeFocused()

    await testPage.startDateField().fill('1/1/2001')
    await testPage.startHourField().fill('x')
    await testPage.startMinuteField().fill('')
    await testPage.endDateField().fill('x')
    await testPage.endHourField().fill('x')
    await testPage.endMinuteField().fill('')
    await testPage.clickButton('Confirm and save')

    await testPage.link('Start date must be on or after 2/1/2001').click()
    await expect(testPage.startDateField()).toBeFocused()
    await testPage.link('Start time hour must be 00 to 23').click()
    await expect(testPage.startHourField()).toBeFocused()
    await testPage.link('Enter a start time').click()
    await expect(testPage.startMinuteField()).toBeFocused()
    await testPage.link('Enter or select a valid return date').click()
    await expect(testPage.endDateField()).toBeFocused()
    await testPage.link('Return time hour must be 00 to 23').click()
    await expect(testPage.endHourField()).toBeFocused()
    await testPage.link('Enter a return time').click()
    await expect(testPage.endMinuteField()).toBeFocused()

    await testPage.startDateField().fill('3/1/2001')
    await testPage.startHourField().fill('12')
    await testPage.startMinuteField().fill('00')
    await testPage.endDateField().fill('2/1/2001')
    await testPage.endHourField().fill('13')
    await testPage.endMinuteField().fill('30')
    await testPage.clickButton('Confirm and save')

    await testPage.link('Return date must be on or before start date').click()
    await expect(testPage.endDateField()).toBeFocused()

    // verify next page routing
    await testPage.endDateField().fill(`3/1/2001`)
    await testPage.clickButton('Confirm and save')

    expect(page.url()).toMatch(/\/temporary-absences\/edit\/confirmation/)
  })
})
