import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class AbsenceApprovalPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/approval/,
      title: 'Select approval option - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Does this absence need to be approved by someone?',
      backUrl: /comments/,
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }
}
