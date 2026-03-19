import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class CreateDocumentPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/create-documents\/temporary-absence\/[\w-]*/,
      title: 'Select document type - Create and download documents - DPS',
      caption: 'Create and download documents',
      heading: 'Choose a document type',
    })
  }

  documentTypeInput() {
    return this.dropdown('Choose a document type')
  }
}
