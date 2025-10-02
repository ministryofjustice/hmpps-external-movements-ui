import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class AbsenceCommentsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/comments/,
      title: 'Enter optional comments - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Enter any relevant comments (optional)',
      backUrl: /\/add-temporary-absence\/transport/,
    })
  }

  commentsInput() {
    return this.textbox('Enter any relevant comments (optional)')
  }
}
