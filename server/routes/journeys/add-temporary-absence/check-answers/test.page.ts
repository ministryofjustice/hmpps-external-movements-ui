import { expect } from '@playwright/test'
import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class AddTapCYAPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/check-answers/,
      title: 'Check your answers - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Check this information before saving this absence',
      backUrl: /approval/,
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

  async clickChangeLinkFor(heading: string) {
    return this.page
      .getByRole('link', { name: new RegExp(`Change\\s*${heading}`, 'i') })
      .first()
      .click()
  }
}
