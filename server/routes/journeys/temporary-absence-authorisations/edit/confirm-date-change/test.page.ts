import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapAuthorisationConfirmDateChangePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/confirm-date-change/,
      title: 'Confirm new dates - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Confirm new dates',
      backUrl: /start-end-dates/,
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }
}
