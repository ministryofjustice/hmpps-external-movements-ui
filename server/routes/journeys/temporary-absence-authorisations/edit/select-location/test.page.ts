import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapAuthorisationSelectLocationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/select-location/,
      title: 'Where will the occurrences take place - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Where will the occurrences take place?',
      backUrl: /confirm-date-change/,
    })
  }
}
