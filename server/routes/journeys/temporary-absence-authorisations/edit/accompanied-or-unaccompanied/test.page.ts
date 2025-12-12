import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapAuthorisationAccompaniedOrUnaccompaniedPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/accompanied-or-unaccompanied/,
      title: 'Select if accompanied or unaccompanied - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Will Prisoner-Name Prisoner-Surname be accompanied?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }
}
