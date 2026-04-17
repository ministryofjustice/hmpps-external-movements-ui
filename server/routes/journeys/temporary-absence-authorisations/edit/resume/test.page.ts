import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class ResumeTapAuthorisationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/resume/,
      title: 'Resume absence plan - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Are you sure you want to resume this absence plan?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }
}
