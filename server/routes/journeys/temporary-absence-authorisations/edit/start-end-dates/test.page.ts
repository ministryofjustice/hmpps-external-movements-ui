import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapAuthorisationStartEndDatesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/start-end-dates/,
      title: 'Change absence dates - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'What dates will this absence start and end?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  startDateField() {
    return this.textbox(/What date will the first absence start\?/)
  }

  endDateField() {
    return this.textbox(/What date will the last absence end\?/)
  }
}
