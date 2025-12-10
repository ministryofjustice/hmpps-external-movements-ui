import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class StartEndDatesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/start-end-dates/,
      title: 'Enter absence start and end dates - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Enter the absence period start and end dates',
      backUrl: /single-or-repeating/,
    })
  }

  startField() {
    return this.textbox(/What date will (.+?)’s first absence start\?/)
  }

  endField() {
    return this.textbox(/What date will (.+?) return from the last absence\?/)
  }
}
