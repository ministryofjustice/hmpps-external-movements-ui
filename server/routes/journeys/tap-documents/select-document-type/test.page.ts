import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class SelectDocumentTypePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/tap-documents\/select-document-type/,
      title: 'Select document type - Create and download documents - DPS',
      caption: 'Create and download documents',
      heading: 'Choose a document type',
    })
  }

  documentTypeInput() {
    return this.dropdown('Choose a document type')
  }
}
