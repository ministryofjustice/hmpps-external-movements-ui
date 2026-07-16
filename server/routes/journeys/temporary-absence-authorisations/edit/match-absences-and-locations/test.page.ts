import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapAuthorisationMatchLocationsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/match-absences-and-locations/,
      title: 'Select where these absences will take place - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Select where these absences will take place',
      backUrl: /select-location/,
    })
  }
}
