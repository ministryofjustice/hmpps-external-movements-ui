import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class SearchLocationsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/search-locations/,
      title: 'Search for a location - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Search for a location where this absence will take place',
      backUrl: /check-absences/,
    })
  }

  searchField() {
    return this.page.getByRole('combobox', { name: 'Search for a location where this absence will take place' }).first()
  }

  async selectAddress(addressText: string) {
    await this.page.locator('li', { hasText: addressText }).first().click()
  }

  async toggleEnterManually() {
    await this.page.locator('span', { hasText: 'Enter a location manually' }).click()
  }

  line1Field() {
    return this.textbox('Address line 1 (optional')
  }

  line2Field() {
    return this.textbox('Address line 2 (optional')
  }

  cityField() {
    return this.textbox('Town or city')
  }

  countyField() {
    return this.textbox('County (optional')
  }

  postcodeField() {
    return this.textbox('Postcode (optional')
  }
}
