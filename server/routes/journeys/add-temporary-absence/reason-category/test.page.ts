import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ReasonCategoryPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/reason-category/,
      title: 'Select absence reason - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'What is the reason for this absence?',
      backUrl: /absence-subtype/,
    })
  }

  fbRadio() {
    return this.radio('Accommodation-related')
  }

  pwRadio() {
    return this.radio(/^Paid work$/)
  }
}
