import { BaseTestPage } from '../../../../integration_tests/pages/baseTestPage'

export class TapOccurrenceDetailsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences\/(\w|-)+/,
      title: 'Manage temporary absence occurrence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: /View .+ temporary absence occurrence/,
    })
  }
}
