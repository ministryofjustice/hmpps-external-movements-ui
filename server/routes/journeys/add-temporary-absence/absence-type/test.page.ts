import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class AbsenceTypePage extends BaseTestPage {
  async verifyContent(prisonNumber: string) {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/absence-type/,
      title: 'Select absence type - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'What type of absence is this?',
      backUrl: new RegExp(`/prisoner/${prisonNumber}`),
    })
  }

  rotlRadio() {
    return this.radio('Standard ROTL (Release on Temporary Licence)')
  }

  securityEscortRadio() {
    return this.radio('Security escort')
  }

  ppRadio() {
    return this.radio('Police production')
  }
}
