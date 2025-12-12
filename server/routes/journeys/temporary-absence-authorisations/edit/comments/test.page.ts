import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapAuthorisationCommentsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/comments$/,
      title: 'Enter comments - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Enter any relevant comments (optional)',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  commentsField() {
    return this.textbox(`Enter any relevant comments (optional)`)
  }
}
