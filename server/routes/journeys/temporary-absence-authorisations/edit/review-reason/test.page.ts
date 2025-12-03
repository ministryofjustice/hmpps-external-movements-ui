import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class TapAuthorisationReviewReasonPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/edit\/review-reason/,
      title: 'Approve or reject absence reason - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: /Enter a reason for (approving|rejecting) this absence \(optional\)/,
      backUrl: /review$/,
    })
  }

  reasonField() {
    return this.textbox(/Enter a reason for (approving|rejecting) this absence/)
  }
}
