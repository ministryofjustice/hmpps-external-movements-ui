import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class SelectSameTimesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/select-same-times/,
      title: 'Select if the times are the same each day or night - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absense',
      heading: 'Will Prisoner-Name Prisoner-Surname’s scheduled days or nights take place at the same times?',
      backUrl: /enter-rotating-pattern/,
    })
  }

  rotatingPatternSubJourneyRadioYes() {
    return this.radio('Yes')
  }

  rotatingPatternSubJourneyRadioNo() {
    return this.radio('No')
  }
}
