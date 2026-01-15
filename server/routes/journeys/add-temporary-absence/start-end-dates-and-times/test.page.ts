import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class StartEndDatesTimesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/start-end-dates-and-times/,
      title: 'Enter absence dates and times - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Enter the absence start and end dates and times',
      backUrl: /single-or-repeating/,
    })
  }

  dateField() {
    return this.textbox(/What date will (.+?)’s absence start\?/)
  }

  hourField() {
    return this.textbox('Hour').nth(0)
  }

  minuteField() {
    return this.textbox('Minute').nth(0)
  }

  endDateField() {
    return this.textbox(/What date will (.+?) return to prison\?/)
  }

  endHourField() {
    return this.textbox('Hour').nth(1)
  }

  endMinuteField() {
    return this.textbox('Minute').nth(1)
  }
}
