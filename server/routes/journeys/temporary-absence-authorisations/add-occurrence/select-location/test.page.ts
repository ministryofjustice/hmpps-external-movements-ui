import { Page } from '@playwright/test'
import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class AddTapOccurrenceSelectLocationPage extends BaseTestPage {
  constructor(
    public override readonly page: Page,
    private readonly location: string,
  ) {
    super(page)
  }

  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/add-occurrence\/select-location/,
      title: 'Select location for new occurrence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: 'Where will this occurrence take place?',
      backUrl: /..\/add-occurrence/,
    })
  }

  locationRadio() {
    return this.radio(this.location)
  }

  newLocationRadio() {
    return this.radio('None of the above, add a new location for this occurrence')
  }
}
