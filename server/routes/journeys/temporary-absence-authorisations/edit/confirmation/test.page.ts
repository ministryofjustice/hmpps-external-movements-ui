import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapAuthorisationConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/confirmation/,
      title: 'Change temporary absence authorisation confirmation - Manage temporary absences - DPS',
      heading: /Temporary absence .+ for Prisoner-Name Prisoner-Surname/,
    })
  }
}
