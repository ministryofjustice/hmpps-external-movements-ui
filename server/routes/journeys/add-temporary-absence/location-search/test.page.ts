import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class LocationSearchPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/location-search/,
      title: 'Search for a location - Add a temporary absence - DPS',
      caption: 'Add a temporary absence',
      heading: 'Search for a location where this absence will take place',
      backUrl: /location-type/,
    })
  }

  searchBox() {
    return this.textbox('Enter an address or postcode')
  }

  searchButton() {
    return this.button('Search')
  }
}
