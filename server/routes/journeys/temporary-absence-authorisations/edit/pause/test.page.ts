import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class PauseTapAuthorisationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/pause/,
      title: 'Pause absence plan - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Are you sure you want to pause this plan?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  reasonField() {
    return this.textbox(/Enter a reason for temporarily pausing this plan/)
  }
}
