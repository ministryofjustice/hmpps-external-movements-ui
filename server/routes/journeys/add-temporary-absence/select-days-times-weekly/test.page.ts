import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class SelectDaysTimesWeeklyPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/select-days-times-weekly/,
      title: 'Enter absence dates and times - Add a temporary absence - DPS',
      caption: 'Add a temporary absence',
      heading: 'undefined',
      backUrl: /repeating-pattern/,
    })
  }
  // Helper: Input getter functions
}
