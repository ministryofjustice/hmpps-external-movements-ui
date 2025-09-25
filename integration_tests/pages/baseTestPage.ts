import { Page, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { deserialiseHistory } from '../../server/middleware/history/historyMiddleware'

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
    expect(this.stripHistoryParam(this.page.url())).toMatch(pageUrl)
    expect(await this.page.title()).toEqual(title)
    await expect(this.page.locator('h1')).toContainText(heading)
    if (caption) {
      await expect(this.page.locator('.govuk-caption-l')).toContainText(caption)
    }
    if (backUrl) {
      const url = await this.page.getByRole('link', { name: /^Back$/ }).getAttribute('href')
      expect(this.stripHistoryParam(url!)).toMatch(backUrl)
    }

    const accessibilityScanResults = await new AxeBuilder({ page: this.page }).analyze()
    expect(accessibilityScanResults.violations).toHaveLength(0)
    return this
  }

  async clickButton(name: string | RegExp) {
    await this.button(name).click()
  }

  async clickContinue() {
    await this.clickButton('Continue')
  }

  button(name: string | RegExp) {
    return this.page.getByRole('button', { name })
  }

  radio(name: string | RegExp) {
    return this.page.getByRole('radio', { name })
  }

  link(name: string | RegExp) {
    return this.page.getByRole('link', { name })
  }

  textbox(name: string | RegExp) {
    return this.page.getByRole('textbox', { name })
  }

  historyParam(url: string, history: RegExp[]) {
    const actualUrl = new URL(url)
    const b64History = actualUrl.searchParams.get('history')
    const actualHistory = deserialiseHistory(b64History as string)

    for (let i = 0; i < history.length; i += 1) {
      expect(actualHistory[i]).toMatch(history[i]!)
    }
  }

  async verifyLink(text: string | RegExp, href: string | RegExp) {
    const url = await this.link(text).getAttribute('href')
    expect(url).not.toBeNull()
    expect(this.stripHistoryParam(url!)).toMatch(href)
  }

  private stripHistoryParam(url: string) {
    const actualUrl = new URL(url.startsWith('http') ? url : `http://localhost:3000${url}`)
    actualUrl.searchParams.delete('history')
    const hash = url.split('#')[1]
    return (
      url.split('?')[0]! +
      (actualUrl.searchParams.size ? '?' : '') +
      actualUrl.searchParams.toString() +
      (hash ? `#${hash}` : '')
    )
  }
}
