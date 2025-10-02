import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class TransportPage extends BaseTestPage {
  async verifyContent(isAccompanied: boolean) {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/transport/,
      title: 'Select transport - Add a temporary absence - DPS',
      caption: 'Add a temporary absence',
      heading: 'What transport will Prisoner-Name Prisoner-Surname use?',
      backUrl: isAccompanied
        ? /\/add-temporary-absence\/accompanied$/
        : /\/add-temporary-absence\/accompanied-or-unaccompanied/,
    })
  }

  transportTypeRadio() {
    return this.radio('Ambulance')
  }
}
