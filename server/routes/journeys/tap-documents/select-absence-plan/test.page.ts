import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class SelectAbsencePlanPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/tap-documents\/select-absence-plan/,
      title: 'Select absence plan - Create and download documents - DPS',
      caption: 'Create and download documents',
      heading: 'Select which plan you want to use',
    })
  }
}
