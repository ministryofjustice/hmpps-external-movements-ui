import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapAuthorisationAccompaniedByPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/accompanied$/,
      title: 'Select who will accompany the prisoner - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Who will accompany Prisoner-Name Prisoner-Surname?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  accompaniedByRadio() {
    return this.radio('accompaniedBy A')
  }
}
