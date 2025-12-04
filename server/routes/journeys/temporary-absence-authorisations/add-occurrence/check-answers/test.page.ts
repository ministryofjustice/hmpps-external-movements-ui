import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class AddTapOccurrenceCheckAnswersPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/add-occurrence\/check-answers/,
      title: 'Check this information before saving this occurrence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Check this information before saving this occurrence',
      backUrl: /comments/,
    })
  }
}
