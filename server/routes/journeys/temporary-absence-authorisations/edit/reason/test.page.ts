import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditAbsenceReasonPage extends BaseTestPage {
  async verifyContent(workReason: boolean) {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/reason$/,
      title: workReason
        ? 'Select type of work - Manage temporary absences - DPS'
        : 'Select absence reason - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: workReason
        ? `What type of work will Prisoner-Name Prisoner-Surname be doing?`
        : 'What is the reason for this absence?',
      backUrl: /\/temporary-absence-authorisations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  workReasonRadio() {
    return this.radio('Agriculture and horticulture')
  }

  otherReasonRadio() {
    return this.radio('Court, legal, police or prison transfer')
  }
}
