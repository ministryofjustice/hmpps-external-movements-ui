import { expect } from '@playwright/test'
import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class CheckPatternPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/check-absences/,
      title: 'Check absences - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Check the dates and times of these absences before continuing',
      backUrl: /repeating-pattern/,
    })
  }

  async verifyAnswer(heading: string | RegExp, value: string | RegExp) {
    const rowHeading = this.page.locator('dt', { hasText: heading })
    await expect(rowHeading).toBeVisible()
    await expect(rowHeading.locator('//following-sibling::dd').first()).toContainText(value)
  }
}
