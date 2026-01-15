import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class SearchPrisonerPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/search-prisoner/,
      title: 'Search for a prisoner - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Search for a prisoner',
    })
  }

  searchField() {
    return this.textbox('Search for a prisoner')
  }
}
