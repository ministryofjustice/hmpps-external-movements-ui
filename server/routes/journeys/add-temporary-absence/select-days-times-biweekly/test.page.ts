import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export class SelectDaysTimesBiweeklyPage extends BaseTestPage {
  async verifyContent(backUrl: RegExp = /repeating-pattern/) {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/select-days-times-biweekly/,
      title: 'Enter absence dates and times - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: /Week [1-2] of 2: Enter the days and times for these absences/,
      backUrl,
    })
  }

  timeEntry(day: Day, segment: 'release' | 'return', cronoUnit: 'Hour' | 'Minute') {
    return this.page.locator(`[id="days[${weekDays.indexOf(day)}][${segment}${cronoUnit}]"]`)
  }

  isOvernight(day: Day) {
    return this.page.locator(`[id="days[${weekDays.indexOf(day)}][isOvernight]"]`)
  }
}
