import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class StartDatePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/start-date/,
      title: 'Enter absence start date and time - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Add absence details',
      backUrl: /single-or-repeating/,
    })
  }

  dateField() {
    return this.textbox(/What date will (.+?) be released\?/)
  }

  hourField() {
    return this.textbox('Hour')
  }

  minuteField() {
    return this.textbox('Minute')
  }
}
