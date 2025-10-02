import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class AccompaniedPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/accompanied$/,
      title: 'Select who will accompany the prisoner - Add a temporary absence - DPS',
      caption: 'Add a temporary absence',
      heading: 'Who will accompany Prisoner-Name Prisoner-Surname?',
      backUrl: /accompanied-or-unaccompanied/,
    })
  }

  accompaniedByRadio() {
    return this.radio('accompaniedBy A')
  }
}
