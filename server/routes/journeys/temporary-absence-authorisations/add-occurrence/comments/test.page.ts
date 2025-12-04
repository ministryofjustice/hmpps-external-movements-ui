import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class AddTapOccurrenceCommentsPage extends BaseTestPage {
  async verifyContent(backUrl: RegExp) {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/add-occurrence\/comments/,
      title: 'Add new occurrence comments - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Enter any relevant comments (optional)',
      backUrl,
    })
  }

  commentsInput() {
    return this.textbox('Enter any relevant comments (optional)')
  }
}
