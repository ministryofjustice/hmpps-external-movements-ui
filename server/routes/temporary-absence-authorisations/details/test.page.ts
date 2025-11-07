import { expect } from '@playwright/test'
import { BaseTestPage } from '../../../../integration_tests/pages/baseTestPage'

export class TapAuthorisationDetailsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/temporary-absence-authorisations\/(\w|-)+/,
      title: 'View temporary absence - View temporary absences - DPS',
      caption: 'Manage Temporary Absences',
      heading: /View .+ temporary absence/,
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

  async verifyTableRow(idx: number, content: (string | RegExp)[]) {
    const row = this.page.locator('tr').nth(idx)
    await expect(row).toBeVisible()
    for (let i = 0; i < content.length; i += 1) {
      await expect(row.locator('td').nth(i)).toContainText(content[i]!)
    }
  }
}
