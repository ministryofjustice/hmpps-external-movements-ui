import { BaseTestPage } from '../../../../integration_tests/pages/baseTestPage'

export class TapAuthorisationDetailsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/(\w|-)+/,
      title: 'Manage temporary absence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: /Manage .+ temporary absence/,
    })
  }
}
