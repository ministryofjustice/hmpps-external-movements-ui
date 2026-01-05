import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class RepeatingPatternPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/repeating-pattern/,
      title: 'Enter repeating pattern - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'How do the occurrences of this absence repeat?',
      backUrl: /start-end-dates/,
    })
  }

  freeformRadio() {
    return this.radio('Do not repeat in a regular pattern')
  }

  weeklyRadio() {
    return this.radio('Repeat weekly')
  }

  rotatingRadio() {
    return this.radio('Repeat in a shift-type pattern')
  }
}
