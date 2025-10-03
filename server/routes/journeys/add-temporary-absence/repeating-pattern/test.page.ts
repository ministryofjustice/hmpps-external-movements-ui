import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class RepeatingPatternPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/repeating-pattern/,
      title: 'Enter repeating pattern - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Will these absences take place in a repeating pattern?',
      backUrl: /start-end-dates/,
    })
  }

  freeformRadio() {
    return this.radio('No')
  }

  weeklyRadio() {
    return this.radio('Yes, repeats weekly')
  }

  rotatingRadio() {
    return this.radio('Yes, repeats on a rotating pattern')
  }
}
