import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class ReviewTapAuthorisationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/review/,
      title: 'Approve absence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Do you want to approve this absence?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  yesRadio() {
    return this.radio('Yes, approve this absence')
  }

  noRadio() {
    return this.radio('No, reject this absence')
  }
}
