import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export class SelectDaysTimesWeeklyPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/select-days-times-weekly/,
      title: 'Enter absence dates and times - Add a temporary absence - DPS',
      caption: 'Add a temporary absence',
      heading: 'Enter the days and times for these absences',
      backUrl: /repeating-pattern/,
    })
  }

  timeEntry(day: Day, segment: 'release' | 'return' | 'overnight', cronoUnit: 'Hour' | 'Minute') {
    return this.page.locator(`[id="days[${weekDays.indexOf(day)}].${segment}${cronoUnit}"]`)
  }

  isOvernight(day: Day) {
    return this.page.locator(`[id="days[${weekDays.indexOf(day)}][isOvernight]"]`)
  }
}
