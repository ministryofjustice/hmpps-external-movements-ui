import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class AccompaniedOrUnaccompaniedPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/accompanied-or-unaccompanied/,
      title: 'Select if accompanied or unaccompanied - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Will Prisoner-Name Prisoner-Surname be accompanied?',
      backUrl: /location-search/,
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }
}
