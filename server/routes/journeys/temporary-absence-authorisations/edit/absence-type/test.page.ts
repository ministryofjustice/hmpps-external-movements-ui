import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditAbsenceTypePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/absence-type/,
      title: 'Select absence type - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'What type of absence is this?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  rotlRadio() {
    return this.radio('Standard ROTL (Release on Temporary Licence)')
  }

  ppRadio() {
    return this.radio('Police production')
  }
}
