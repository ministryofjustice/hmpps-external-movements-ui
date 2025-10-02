import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class EndDatePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/end-date/,
      title: 'Enter absence end date and time - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Add absence details',
      backUrl: /start-date/,
    })
  }

  dateField() {
    return this.textbox(/What date will (.+?) return to prison\?/)
  }

  hourField() {
    return this.textbox('Hour')
  }

  minuteField() {
    return this.textbox('Minute')
  }
}
