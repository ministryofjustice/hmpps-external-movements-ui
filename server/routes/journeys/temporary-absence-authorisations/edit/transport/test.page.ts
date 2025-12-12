import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapAuthorisationTransportPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/transport$/,
      title: 'Select transport - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'What transport will Prisoner-Name Prisoner-Surname use?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  transportTypeRadio() {
    return this.radio('Ambulance')
  }
}
