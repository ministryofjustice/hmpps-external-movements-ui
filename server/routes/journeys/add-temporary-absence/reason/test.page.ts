import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class AbsenceReasonPage extends BaseTestPage {
  async verifyContent(workReason: boolean) {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/reason/,
      title: workReason
        ? 'Select type of work - Add a temporary absence - DPS'
        : 'Select absence reason - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: workReason
        ? `What type of work will Prisoner-Name Prisoner-Surname be doing?`
        : 'What is the reason for this absence?',
      backUrl: workReason ? /reason-category/ : /absence-subtype/,
    })
  }

  workReasonRadio() {
    return this.radio('Agriculture and horticulture')
  }

  otherReasonRadio() {
    return this.radio('Court, legal, police or prison transfer')
  }
}
