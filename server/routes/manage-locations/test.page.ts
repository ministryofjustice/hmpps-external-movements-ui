import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class ManageLocationsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/manage-locations/,
      title: 'Manage temporary absence locations - DPS',
      caption: 'Manage saved temporary absence locations',
      heading: 'Manage temporary absence locations',
    })
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
