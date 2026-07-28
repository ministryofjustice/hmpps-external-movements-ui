import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class TapLocationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/location/,
      title: 'Add a location for this absence - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Add a location for this absence',
      backUrl: /start-end-dates-and-times/,
    })
  }

  savedLocationDropdown() {
    return this.dropdown('Search saved locations')
  }

  selectSavedLocation(label: string | RegExp) {
    return this.page.getByText(label).first().click()
  }

  searchField() {
    return this.page.getByRole('combobox', { name: 'Search and add a UK address' }).first()
  }

  async selectAddress(addressText: string) {
    await this.page.getByText(addressText).first().click()
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

  areaField() {
    return this.textbox('Area description')
  }
}
