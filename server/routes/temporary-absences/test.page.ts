import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class BrowseTapOccurrencesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences/,
      title: 'Manage temporary absence occurrences - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: /Manage temporary absence occurrences in .+/,
    })
  }

  searchField() {
    return this.textbox('Name or prison number')
  }

  startDateField() {
    return this.textbox('Start date from')
  }

  endDateField() {
    return this.textbox('End date to')
  }

  statusCheckbox() {
    return this.checkbox('Scheduled')
  }
}
