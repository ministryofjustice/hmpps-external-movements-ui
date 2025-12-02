import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class BrowseTapAuthorisationsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations/,
      title: 'Manage temporary absences - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: /Manage temporary absences in .+/,
    })
  }

  searchField() {
    return this.textbox('Name or prison number')
  }

  fromDateField() {
    return this.textbox('Start date from')
  }

  toDateField() {
    return this.textbox('End date to')
  }

  statusDropdown() {
    return this.dropdown('Absence status')
  }
}
