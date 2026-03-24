import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class ViewPrisonerAbsencesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-schedule-enquiry/,
      title: 'View a prisoner’s temporary absences - Manage temporary absences - DPS',
      caption: 'View a prisoner’s temporary absences',
      heading: /View .+’s temporary absences/,
    })
  }

  startDateField() {
    return this.textbox('Show absences between')
  }

  endDateField() {
    return this.textbox('and')
  }

  statusCheckbox() {
    return this.checkbox('Scheduled')
  }
}
