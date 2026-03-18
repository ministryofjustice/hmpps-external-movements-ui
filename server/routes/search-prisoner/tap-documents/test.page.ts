import { BaseTestPage } from '../../../../integration_tests/pages/baseTestPage'

export class TapDocumentSearchPrisonerPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/search-prisoner\/tap-documents/,
      title: 'Search for a prisoner - Create and download documents - DPS',
      caption: 'Create and download documents',
      heading: 'Search for a prisoner',
    })
  }

  searchField() {
    return this.textbox('Search for a prisoner')
  }
}
