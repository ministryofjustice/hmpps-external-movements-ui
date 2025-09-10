import { Page, expect } from '@playwright/test'

export class BaseTestPage {
  constructor(public readonly page: Page) {}

  async verify({
    pageUrl,
    title,
    heading,
    caption,
    backUrl,
  }: {
    pageUrl: RegExp
    title: string
    heading: string
    caption?: string
    backUrl?: RegExp
  }) {
    expect(this.page.url()).toMatch(pageUrl)
    expect(await this.page.title()).toEqual(title)
    await expect(this.page.locator('h1')).toContainText(heading)
    if (caption) {
      await expect(this.page.locator('.govuk-caption-l')).toContainText(caption)
    }
    if (backUrl) {
      await expect(this.page.getByRole('link', { name: /^Back$/ })).toHaveAttribute('href', backUrl)
    }
    return this
  }

  async clickButton(name: string) {
    await this.button(name).click()
  }

  async clickContinue() {
    await this.clickButton('Continue')
  }

  button(name: string) {
    return this.page.getByRole('button', { name })
  }

  radio(name: string) {
    return this.page.getByRole('radio', { name })
  }

  link(name: string) {
    return this.page.getByRole('link', { name })
  }
}
