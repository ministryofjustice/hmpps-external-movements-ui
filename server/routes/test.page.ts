import { BaseTestPage } from '../../integration_tests/pages/baseTestPage'

export class TapHomePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences-home/,
      title: 'Temporary absence - External movements - DPS',
      heading: 'Temporary absences',
    })
  }
}
