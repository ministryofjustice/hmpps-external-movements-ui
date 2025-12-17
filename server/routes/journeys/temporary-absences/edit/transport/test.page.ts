import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapOccurrenceTransportPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences\/edit\/transport/,
      title: 'Select transport - Edit a temporary absence - DPS',
      caption: 'Edit a Temporary Absences',
      heading: 'What transport will Prisoner-Name Prisoner-Surname use?',
      backUrl: /\/temporary-absences\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  transportTypeRadio() {
    return this.radio('Ambulance')
  }
}
