import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../integration_tests/mockApis/auth'
import componentsApi from '../../../../integration_tests/mockApis/componentsApi'
import { signIn } from '../../../../integration_tests/steps/signIn'
import { randomPrisonNumber } from '../../../../integration_tests/data/testData'
import { stubGetPrisonerDetails } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import {
  stubGetAbsenceCategory,
  stubGetAllAbsenceTypes,
  stubGetReferenceData,
  stubPostCreateTap,
} from '../../../../integration_tests/mockApis/externalMovementsApi'
import { injectJourneyData } from '../../../../integration_tests/steps/journey'
import { AbsenceTypePage } from './absence-type/test.page'
import { AbsenceSubTypePage } from './absence-subtype/test.page'
import { ReasonCategoryPage } from './reason-category/test.page'
import { AbsenceReasonPage } from './reason/test.page'
import { SingleOrRepeatingPage } from './single-or-repeating/test.page'
import { StartDatePage } from './start-date/test.page'
import { EndDatePage } from './end-date/test.page'
import { AccompaniedOrUnaccompaniedPage } from './accompanied-or-unaccompanied/test.page'
import { AccompaniedPage } from './accompanied/test.page'
import { TransportPage } from './transport/test.page'
import { AbsenceApprovalPage } from './approval/test.page'
import { AbsenceCommentsPage } from './comments/test.page'
import { AddTapCYAPage } from './check-answers/test.page'
import { getApiBody } from '../../../../integration_tests/mockApis/wiremock'
import { stubGetAddress, stubSearchAddresses } from '../../../../integration_tests/mockApis/osPlacesApi'
import { SearchLocationPage } from './search-location/test.page'

test.describe('/add-temporary-absence/e2e', () => {
  const prisonNumber = randomPrisonNumber()

  test.beforeEach(async ({ page }) => {
    const address = {
      addressString: 'Address',
      buildingName: '',
      subBuildingName: '',
      thoroughfareName: 'Random Street',
      dependentLocality: '',
      postTown: '',
      county: '',
      postcode: 'RS1 34T',
      country: 'E',
      uprn: 2001,
    }

    await Promise.all([
      auth.stubSignIn(),
      componentsApi.stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails({ prisonerNumber: prisonNumber }),
      stubGetAllAbsenceTypes(),
      stubGetAbsenceCategory('ABSENCE_TYPE', 'SE'),
      stubGetAbsenceCategory('ABSENCE_TYPE', 'SR'),
      stubGetAbsenceCategory('ABSENCE_SUB_TYPE', 'RDR'),
      stubGetAbsenceCategory('ABSENCE_SUB_TYPE', 'SPL'),
      stubGetAbsenceCategory('ABSENCE_REASON_CATEGORY', 'PW'),
      stubGetReferenceData('accompanied-by'),
      stubGetReferenceData('transport'),
      stubSearchAddresses('qwerty', [address]),
      stubSearchAddresses('SW1H%209AJ', [address]), // query used by the module to check OS Places API availability
      stubGetAddress('2001', address),
      stubPostCreateTap(prisonNumber),
    ])

    await signIn(page)
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/add-temporary-absence/start/${prisonNumber}`)
    await injectJourneyData(page, journeyId, { stateGuard: true })
  }

  test.describe('journey state guard', () => {
    test('type -> reason -> single-or-repeating', async ({ page }) => {
      const journeyId = uuidV4()
      await startJourney(page, journeyId)

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-type/)

      const absencePage = new AbsenceTypePage(page)
      await absencePage.securityEscortRadio().click()
      await absencePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/reason/)

      const reasonPage = new AbsenceReasonPage(page)
      await reasonPage.page.getByRole('radio', { name: /CRL/ }).click()
      await reasonPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/single-or-repeating/)
    })

    test('type -> subtype -> single-or-repeating', async ({ page }) => {
      const journeyId = uuidV4()
      await startJourney(page, journeyId)

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-type/)

      const absencePage = new AbsenceTypePage(page)
      await absencePage.rotlRadio().click()
      await absencePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-subtype/)

      const subtypePage = new AbsenceSubTypePage(page)
      await subtypePage.crlRadio().click()
      await subtypePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/single-or-repeating/)
    })

    test('type -> subtype -> reason-category -> single-or-repeating', async ({ page }) => {
      const journeyId = uuidV4()
      await startJourney(page, journeyId)

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-type/)

      const absencePage = new AbsenceTypePage(page)
      await absencePage.rotlRadio().click()
      await absencePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-subtype/)

      const subtypePage = new AbsenceSubTypePage(page)
      await subtypePage.rdrRadio().click()
      await subtypePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/reason-category/)

      const reasonCategoryPage = new ReasonCategoryPage(page)
      await reasonCategoryPage.fbRadio().click()
      await reasonCategoryPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/single-or-repeating/)
    })

    test('type -> subtype -> reason-category -> reason -> single-or-repeating', async ({ page }) => {
      const journeyId = uuidV4()
      await startJourney(page, journeyId)

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-type/)

      const absencePage = new AbsenceTypePage(page)
      await absencePage.rotlRadio().click()
      await absencePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-subtype/)

      const subtypePage = new AbsenceSubTypePage(page)
      await subtypePage.rdrRadio().click()
      await subtypePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/reason-category/)

      const reasonCategoryPage = new ReasonCategoryPage(page)
      await reasonCategoryPage.pwRadio().click()
      await reasonCategoryPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/reason/)

      const reasonPage = new AbsenceReasonPage(page)
      await reasonPage.workReasonRadio().click()
      await reasonPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/single-or-repeating/)
    })

    test('type -> subtype -> reason -> single-or-repeating', async ({ page }) => {
      const journeyId = uuidV4()
      await startJourney(page, journeyId)

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-type/)

      const absencePage = new AbsenceTypePage(page)
      await absencePage.rotlRadio().click()
      await absencePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-subtype/)

      const subtypePage = new AbsenceSubTypePage(page)
      await subtypePage.rdrRadio().click()
      await subtypePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/reason/)

      const reasonPage = new AbsenceReasonPage(page)
      await reasonPage.page.getByRole('radio', { name: 'Accommodation-related' }).click()
      await reasonPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/single-or-repeating/)
    })

    test('type -> single-or-repeating -> rest of the journey', async ({ page }) => {
      const journeyId = uuidV4()
      await startJourney(page, journeyId)

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-type/)

      const absencePage = new AbsenceTypePage(page)
      await absencePage.ppRadio().click()
      await absencePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/single-or-repeating/)

      const singleOrRepeatingPage = new SingleOrRepeatingPage(page)
      await singleOrRepeatingPage.singleRadio().click()
      await singleOrRepeatingPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/start-date/)

      const startDatePage = new StartDatePage(page)
      await startDatePage.dateField().fill('10/10/2069')
      await startDatePage.hourField().fill('12')
      await startDatePage.minuteField().fill('30')
      await startDatePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/end-date/)

      const endDatePage = new EndDatePage(page)
      await endDatePage.dateField().fill('11/10/2069')
      await endDatePage.hourField().fill('12')
      await endDatePage.minuteField().fill('30')
      await endDatePage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/search-location/)

      const searchLocationPage = new SearchLocationPage(page)
      await searchLocationPage.searchField().fill('qwerty')
      await searchLocationPage.selectAddress('Address, RS1 34T')
      await searchLocationPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)

      const accompaniedOrUnaccompaniedPage = new AccompaniedOrUnaccompaniedPage(page)
      await accompaniedOrUnaccompaniedPage.yesRadio().click()
      await accompaniedOrUnaccompaniedPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/accompanied/)

      const accompaniedPage = new AccompaniedPage(page)
      await accompaniedPage.accompaniedByRadio().click()
      await accompaniedPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/transport/)

      const transportPage = new TransportPage(page)

      // Go back to accompanied or unaccompanied page
      await transportPage.page.getByRole('link', { name: 'back' }).click()
      await accompaniedPage.page.getByRole('link', { name: 'back' }).click()

      await accompaniedOrUnaccompaniedPage.noRadio().click()
      await accompaniedOrUnaccompaniedPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/transport/)

      await transportPage.transportTypeRadio().click()
      await transportPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/comments/)

      const commentsPage = new AbsenceCommentsPage(page)
      await commentsPage.commentsInput().fill('Sample text')
      await commentsPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/approval/)

      const approvalPage = new AbsenceApprovalPage(page)
      await approvalPage.yesRadio().click()
      await approvalPage.clickContinue()

      await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)
      expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/check-answers/)
    })
  })

  test('E2E', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)
    await page.goto(`/${journeyId}/add-temporary-absence/check-answers`)

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-type/)

    const absencePage = new AbsenceTypePage(page)
    await absencePage.ppRadio().click()
    await absencePage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/single-or-repeating/)

    const singleOrRepeatingPage = new SingleOrRepeatingPage(page)
    await singleOrRepeatingPage.singleRadio().click()
    await singleOrRepeatingPage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/start-date/)

    const startDatePage = new StartDatePage(page)
    await startDatePage.dateField().fill('10/10/2069')
    await startDatePage.hourField().fill('12')
    await startDatePage.minuteField().fill('30')
    await startDatePage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/end-date/)

    const endDatePage = new EndDatePage(page)
    await endDatePage.dateField().fill('11/10/2069')
    await endDatePage.hourField().fill('12')
    await endDatePage.minuteField().fill('30')
    await endDatePage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/search-location/)

    const searchLocationPage = new SearchLocationPage(page)
    await searchLocationPage.searchField().fill('qwerty')
    await searchLocationPage.selectAddress('Address, RS1 34T')
    await searchLocationPage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)

    const accompaniedOrUnaccompaniedPage = new AccompaniedOrUnaccompaniedPage(page)
    await accompaniedOrUnaccompaniedPage.yesRadio().click()
    await accompaniedOrUnaccompaniedPage.clickContinue()

    const accompaniedPage = new AccompaniedPage(page)
    await accompaniedPage.accompaniedByRadio().click()
    await accompaniedPage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/transport/)

    const transportPage = new TransportPage(page)
    await transportPage.transportTypeRadio().click()
    await transportPage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/comments/)

    const commentsPage = new AbsenceCommentsPage(page)
    await commentsPage.commentsInput().fill('Sample text')
    await commentsPage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/approval/)

    const approvalPage = new AbsenceApprovalPage(page)
    await approvalPage.yesRadio().click()
    await approvalPage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/check-answers/)

    const checkAnswersPage = new AddTapCYAPage(page)
    await checkAnswersPage.verifyAnswer('Absence type', 'Police production')
    await checkAnswersPage.verifyAnswerNotVisible('Absence sub-type')
    await checkAnswersPage.verifyAnswerNotVisible('Absence reason')
    await checkAnswersPage.verifyAnswer('Single or repeating absence', 'Single')
    await checkAnswersPage.verifyAnswer('Start date', '10 October 2069')
    await checkAnswersPage.verifyAnswer('Start time', '12:30')
    await checkAnswersPage.verifyAnswer('End date', '11 October 2069')
    await checkAnswersPage.verifyAnswer('End time', '12:30')
    await checkAnswersPage.verifyAnswer(/Location\s+$/, /Address, RS1 34T/)
    await checkAnswersPage.verifyAnswer('Accompanied or unaccompanied', 'Accompanied')
    await checkAnswersPage.verifyAnswer('Accompanied by', 'accompaniedBy A')
    await checkAnswersPage.verifyAnswer('Transport', 'Ambulance')
    await checkAnswersPage.verifyAnswer('Relevant comments', 'Sample text')
    await checkAnswersPage.verifyAnswer('Approval needed?', 'Yes')

    await checkAnswersPage.clickChangeLinkFor('Absence type')
    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-type/)

    await absencePage.rotlRadio().click()
    await absencePage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/absence-subtype/)

    const absenceSubTypePage = new AbsenceSubTypePage(page)
    await absenceSubTypePage.crlRadio().click()
    await absenceSubTypePage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/check-answers/)

    await checkAnswersPage.verifyAnswer('Absence type', 'Standard ROTL (Release on Temporary Licence)')
    await checkAnswersPage.verifyAnswer('Absence sub-type', 'CRL (Childcare Resettlement Licence)')

    await checkAnswersPage.clickChangeLinkFor('if the prisoner will be accompanied or unaccompanied')
    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/accompanied-or-unaccompanied/)

    await accompaniedOrUnaccompaniedPage.noRadio().click()
    await accompaniedOrUnaccompaniedPage.clickContinue()

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/check-answers/)

    await checkAnswersPage.verifyAnswer('Accompanied or unaccompanied', 'Unaccompanied')
    await checkAnswersPage.verifyAnswerNotVisible('Accompanied by')
    await checkAnswersPage.clickButton('Confirm and save')

    expect(page.url().split('?')[0]).toMatch(/\/add-temporary-absence\/confirmation/)

    await page.goBack()

    expect(page.url().split('?')[0]).toMatch(/\/$/)

    expect(await getApiBody(`/external-movements-api/temporary-absence-authorisations/${prisonNumber}`)).toEqual([
      {
        absenceSubTypeCode: 'CRL',
        absenceTypeCode: 'SR',
        fromDate: '2069-10-10T12:30:00',
        notes: 'Sample text',
        occurrences: [
          {
            accompaniedByCode: 'U',
            location: {
              id: '2001',
              description: 'Address, RS1 34T',
            },
            notes: 'Sample text',
            releaseAt: '2069-10-10T12:30:00',
            returnBy: '2069-10-11T12:30:00',
            transportCode: 'AMB',
          },
        ],
        repeat: false,
        statusCode: 'PENDING',
        submittedAt: expect.any(String),
        toDate: '2069-10-11T12:30:00',
      },
    ])
  })
})
