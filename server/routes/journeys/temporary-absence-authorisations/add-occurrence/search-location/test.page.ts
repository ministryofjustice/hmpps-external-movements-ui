import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class AddTapOccurrenceSearchLocationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/add-occurrence\/search-location/,
      title: 'Add a location for this absence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Add a location for this absence',
      backUrl: /select-location/,
    })
  }

  searchField() {
    return this.page.getByRole('combobox', { name: 'Add a location for this absence' }).first()
  }

  async selectAddress(addressText: string) {
    await this.page.getByText(addressText).first().click()
  }

  async clickEnterManually() {
    await this.link('Enter a location manually').click()
  }
}
