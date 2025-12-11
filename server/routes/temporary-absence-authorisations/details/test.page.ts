import { expect } from '@playwright/test'
import { BaseTestPage } from '../../../../integration_tests/pages/baseTestPage'

export class TapAuthorisationDetailsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/(\w|-)+/,
      title: 'Manage temporary absence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: /Manage .+ temporary absence/,
    })
  }

  async verifyHistoryEntry(heading: string | RegExp, contents: (string | RegExp)[], changes: (string | RegExp)[]) {
    const headingElement = this.page.getByRole('heading', { name: heading })
    await expect(headingElement).toBeVisible()

    const entryElement = headingElement.locator('../..')

    for (const content of contents) {
      await expect(entryElement.getByText(content)).toBeVisible()
    }

    if (changes.length) await entryElement.getByText('View update details').click()
    for (const change of changes) {
      await expect(entryElement.getByText(change)).toBeVisible()
    }
  }
}
