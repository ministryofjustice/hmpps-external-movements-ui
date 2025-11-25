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

  async verifyAnswer(heading: string | RegExp, value: string | RegExp) {
    const rowHeading = this.page.locator('dt', { hasText: heading })
    await expect(rowHeading).toBeVisible()
    await expect(rowHeading.locator('//following-sibling::dd').first()).toContainText(value)
  }

  async verifyAnswerNotVisible(heading: string | RegExp) {
    const rowHeading = this.page.locator('dt', { hasText: heading })
    await expect(rowHeading).not.toBeVisible()
  }
}
