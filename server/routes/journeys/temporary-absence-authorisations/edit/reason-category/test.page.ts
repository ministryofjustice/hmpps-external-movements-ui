import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditAbsenceReasonCategoryPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/reason-category/,
      title: 'Select absence reason - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'What is the reason for this absence?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  fbRadio() {
    return this.radio('Accommodation-related')
  }

  pwRadio() {
    return this.radio(/^Paid work$/)
  }

  upwRadio() {
    return this.radio(/^Unpaid work$/)
  }
}
