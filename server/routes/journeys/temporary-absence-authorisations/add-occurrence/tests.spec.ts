import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetTapAuthorisation } from '../../../../../integration_tests/mockApis/externalMovementsApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { AddTapOccurrencePage } from './test.page'

test.describe('/temporary-absence-authorisations/add-occurrence', () => {
  const prisonNumber = randomPrisonNumber()
  const authorisationId = uuidV4()

  const authorisation = {
    id: authorisationId,
    person: {
      personIdentifier: prisonNumber,
      firstName: 'PRISONER-NAME',
      lastName: 'PRISONER-SURNAME',
      dateOfBirth: '1990-01-01',
      cellLocation: '2-1-005',
    },
    status: { code: 'PENDING', description: 'To be reviewed' },
    absenceType: {
      code: 'RR',
      description: 'Restricted ROTL (Release on Temporary Licence)',
    },
    repeat: true,
    fromDate: '2001-01-02',
    toDate: '2001-01-05',
    accompaniedBy: { code: 'U', description: 'Unaccompanied' },
    transport: { code: 'CAR', description: 'Car' },
    locations: [{ uprn: '1001', description: 'Random Street, UK' }],
    occurrences: [
      {
        id: 'occurrence-id-1',
        status: { code: 'PENDING', description: 'To be reviewed' },
        releaseAt: '2001-01-02T10:00:00',
        returnBy: '2001-01-02T17:30:00',
        location: { uprn: '1001', description: 'Random Street, UK' },
        accompaniedBy: { code: 'U', description: 'Unaccompanied' },
        transport: { code: 'CAR', description: 'Car' },
      },
    ],
  }

  test.beforeAll(async () => {
    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetTapAuthorisation(authorisation),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/temporary-absence-authorisations/start-add-occurrence/${authorisationId}`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new AddTapOccurrencePage(page).verifyContent()

    await expect(testPage.startDateField()).toBeVisible()
    await expect(testPage.startDateField()).toHaveValue('')
    await expect(testPage.startHourField()).toBeVisible()
    await expect(testPage.startHourField()).toHaveValue('')
    await expect(testPage.startMinuteField()).toBeVisible()
    await expect(testPage.startMinuteField()).toHaveValue('')
    await expect(testPage.endDateField()).toBeVisible()
    await expect(testPage.endDateField()).toHaveValue('')
    await expect(testPage.endHourField()).toBeVisible()
    await expect(testPage.endHourField()).toHaveValue('')
    await expect(testPage.endMinuteField()).toBeVisible()
    await expect(testPage.endMinuteField()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
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
    await testPage.clickContinue()

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
    await testPage.clickContinue()

    await testPage.link('Return date must be on or before start date').click()
    await expect(testPage.endDateField()).toBeFocused()

    // verify next page routing
    await testPage.endDateField().fill(`3/1/2001`)
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/search-location/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()

    await expect(testPage.startDateField()).toHaveValue('3/1/2001')
    await expect(testPage.startHourField()).toHaveValue('12')
    await expect(testPage.startMinuteField()).toHaveValue('00')
    await expect(testPage.endDateField()).toHaveValue('3/1/2001')
    await expect(testPage.endHourField()).toHaveValue('13')
    await expect(testPage.endMinuteField()).toHaveValue('30')
  })
})
