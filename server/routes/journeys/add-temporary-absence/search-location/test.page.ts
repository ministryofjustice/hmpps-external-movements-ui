import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class SearchLocationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/search-location/,
      title: 'Search for a location - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Add a location for this absence',
      backUrl: /end-date/,
    })
  }

  searchField() {
    return this.page.getByRole('combobox', { name: 'Add a location for this absence' }).first()
  }

  async selectAddress(addressText: string) {
    await this.page.getByText(addressText).first().click()
  }
}
