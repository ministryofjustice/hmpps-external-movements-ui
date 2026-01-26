import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class BrowseTapAuthorisationsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations/,
      title: 'Manage temporary absence plans - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: /Manage temporary absence plans in .+/,
    })
  }

  searchField() {
    return this.textbox('Name or prison number')
  }

  startDateField() {
    return this.textbox('Show absences between')
  }

  endDateField() {
    return this.textbox('and')
  }

  statusCheckbox() {
    return this.checkbox('Approved')
  }
}
