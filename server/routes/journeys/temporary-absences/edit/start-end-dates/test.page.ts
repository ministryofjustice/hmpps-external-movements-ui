import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapOccurrenceStartEndDatesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences\/edit\/start-end-dates/,
      title: 'Change occurrence start and end date and time - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'What dates and times will this absence occurrence start and end?',
      backUrl: /\/temporary-absences\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  startDateField() {
    return this.textbox(/What date will this absence occurrence start\?/)
  }

  startHourField() {
    return this.textbox('Hour').nth(0)
  }

  startMinuteField() {
    return this.textbox('Minute').nth(0)
  }

  endDateField() {
    return this.textbox(/What date will this absence occurrence end\?/)
  }

  endHourField() {
    return this.textbox('Hour').nth(1)
  }

  endMinuteField() {
    return this.textbox('Minute').nth(1)
  }
}
