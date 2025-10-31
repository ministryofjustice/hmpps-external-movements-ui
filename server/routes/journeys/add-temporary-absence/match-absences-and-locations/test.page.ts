import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class MatchAbsencesAndLocationsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/match-absences-and-locations/,
      title: 'Match absences and locations - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Select where these absences will take place',
      backUrl: /search-locations/,
    })
  }
}
