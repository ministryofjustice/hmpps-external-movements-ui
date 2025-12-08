import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class AddTapOccurrenceConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/add-occurrence\/confirmation/,
      title: 'Add occurrence confirmation - Manage temporary absences - DPS',
      heading: 'Temporary absence occurrence added for Prisoner-Name Prisoner-Surname',
    })
  }
}
