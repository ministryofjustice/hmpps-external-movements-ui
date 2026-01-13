import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapOccurrenceSearchLocationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences\/edit\/search-location/,
      title: 'Add a location for this absence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Add a location for this absence',
      backUrl: /\/temporary-absences\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  searchField() {
    return this.page.getByRole('combobox', { name: 'Add a location for this absence' }).first()
  }

  async selectAddress(addressText: string) {
    await this.page.getByText(addressText).first().click()
  }
}
