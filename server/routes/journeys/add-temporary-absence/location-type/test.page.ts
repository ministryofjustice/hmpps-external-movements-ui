import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class LocationTypePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/location-type/,
      title: 'Select location type - Add a temporary absence - DPS',
      caption: 'Add a temporary absence',
      heading: 'What type of location will Prisoner-Name Prisoner-Surname be going to?',
      backUrl: /end-date/,
    })
  }

  locationTypeRadio() {
    return this.radio('locationType A')
  }
}
