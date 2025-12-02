import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class CancelTapAuthorisationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/cancel/,
      title: 'Cancel absence reason - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Are you sure you want to cancel this absence?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  reasonField() {
    return this.textbox(/Enter a reason for cancelling this absence/)
  }
}
