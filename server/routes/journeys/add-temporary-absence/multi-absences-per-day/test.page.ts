import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class MultiAbsencesPerDayPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/multi-absences-per-day/,
      title: 'Will the prisoner have multiple absences in the same day? - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Will the prisoner have multiple absences in the same day?',
      backUrl: /repeating-pattern/,
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }

  absencesPerDayInput() {
    return this.textbox('How many absences will there be each day?')
  }
}
