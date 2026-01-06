import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class AddTapOccurrencePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/add-occurrence$/,
      title: 'Add occurrence to this absence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Add an occurrence to this absence',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  startDateField() {
    return this.textbox(/What date will this occurrence start\?/)
  }

  startHourField() {
    return this.textbox('Hour').nth(0)
  }

  startMinuteField() {
    return this.textbox('Minute').nth(0)
  }

  endDateField() {
    return this.textbox(/What date will this occurrence end\?/)
  }

  endHourField() {
    return this.textbox('Hour').nth(1)
  }

  endMinuteField() {
    return this.textbox('Minute').nth(1)
  }
}
