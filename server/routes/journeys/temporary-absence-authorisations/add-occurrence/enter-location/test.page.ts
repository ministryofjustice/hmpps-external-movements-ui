import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class AddTapOccurrenceEnterLocationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/add-occurrence\/enter-location/,
      title: 'Enter the location of this absence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
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
