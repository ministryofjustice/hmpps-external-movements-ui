import { Page } from '@playwright/test'
import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTapOccurrenceSelectLocationPage extends BaseTestPage {
  constructor(
    public override readonly page: Page,
    private readonly location: string,
  ) {
    super(page)
  }

  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences\/edit\/select-location/,
      title: 'Select location for occurrence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Where will this occurrence take place?',
      backUrl: /\/temporary-absences\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  locationRadio() {
    return this.radio(this.location)
  }

  newLocationRadio() {
    return this.radio('None of the above, add a new location for this occurrence')
  }
}
