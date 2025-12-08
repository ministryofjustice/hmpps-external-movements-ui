import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditAbsenceCommentsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences\/edit\/comments/,
      title: 'Enter optional comments - Manage Temporary Absence - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Enter any relevant comments (optional)',
    })
  }

  notesField() {
    return this.textbox(`Enter any relevant comments (optional)`).nth(0)
  }
}
