import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapAuthorisationChangeConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/change-confirmation$/,
      title: 'Are you sure you want to change this? - Manage temporary absences - DPS',
      heading: 'Are you sure you want to change this?',
    })
  }

  goBackLink() {
    return this.link('Go back')
  }
}
