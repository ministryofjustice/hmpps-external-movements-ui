import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class AbsenceSubTypePage extends BaseTestPage {
  async verifyContent(typeName: string) {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/absence-subtype/,
      title: `Select ${typeName} type - Add a temporary absence - DPS`,
      caption: 'Create a Temporary Absence',
      heading: `What type of ${typeName} is this?`,
      backUrl: /absence-type/,
    })
  }

  crlRadio() {
    return this.radio('CRL (Childcare Resettlement Licence)')
  }

  rdrRadio() {
    return this.radio('RDR (Resettlement Day Release)')
  }

  splRadio() {
    return this.radio('SPL (Special Purpose Licence)')
  }
}
