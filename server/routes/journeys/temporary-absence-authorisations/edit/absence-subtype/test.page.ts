import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditAbsenceSubTypePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/absence-subtype/,
      title: 'Select restricted ROTL (Release on Temporary Licence) type - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'What type of restricted ROTL (Release on Temporary Licence) is this?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
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
