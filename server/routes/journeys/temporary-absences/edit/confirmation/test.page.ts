import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapOccurrenceConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences\/edit\/confirmation/,
      title: 'Change temporary absence occurrence confirmation - Manage temporary absences - DPS',
      heading: /Absence .+/,
    })
  }
}
