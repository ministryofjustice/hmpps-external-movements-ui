import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class StartEndDatesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/start-end-dates/,
      title: 'Enter absence start and end dates - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Add absence period',
      backUrl: /single-or-repeating/,
    })
  }

  fromDateField() {
    return this.textbox(/What date will (.+?) be released for the first absence\?/)
  }

  toDateField() {
    return this.textbox(/What date will (.+?) return from the last absence\?/)
  }
}
