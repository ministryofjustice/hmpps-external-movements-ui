import { BaseTestPage } from '../../../../integration_tests/pages/baseTestPage'

export class RemoveLocationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/manage-locations\/remove/,
      title: 'Confirm you want to remove this saved location - Manage temporary absence locations - DPS',
      caption: 'Manage saved temporary absence locations',
      heading: 'Confirm you want to remove this saved location',
      backUrl: /manage-locations/,
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }
}
