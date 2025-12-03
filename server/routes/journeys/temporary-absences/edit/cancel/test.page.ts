import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class CancelTapOccurrencePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences\/edit\/cancel/,
      title: 'Cancel occurrence reason - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Are you sure you want to cancel this occurrence?',
      backUrl: /\/temporary-absences\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  reasonField() {
    return this.textbox(/Enter a reason for cancelling this absence/)
  }
}
