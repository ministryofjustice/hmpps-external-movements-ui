import { expect } from '@playwright/test'
import { BaseTestPage } from '../../../../integration_tests/pages/baseTestPage'

export class TapOccurrenceDetailsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absences\/(\w|-)+/,
      title: 'Manage temporary absence occurrence - Manage temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: /View .+ temporary absence occurrence/,
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
