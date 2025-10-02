import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class AddAbsenceConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/confirmation/,
      title: 'Absence saved - Add a temporary absence - DPS',
      heading: 'Temporary absence saved for Prisoner-Name Prisoner-Surname',
    })
  }
}
