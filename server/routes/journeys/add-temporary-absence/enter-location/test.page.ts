import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class EnterLocationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/enter-location/,
      title: 'Enter the location of this absence - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Enter the location of this absence',
      backUrl: /search-location/,
    })
  }

  organisationNameField() {
    return this.textbox('Business or organisation name (optional)')
  }

  line1Field() {
    return this.textbox('Address line 1 (optional)')
  }

  line2Field() {
    return this.textbox('Address line 2 (optional)')
  }

  cityField() {
    return this.textbox('Town or city')
  }

  countyField() {
    return this.textbox('County (optional)')
  }

  postcodeField() {
    return this.textbox('Postcode (optional)')
  }
}
