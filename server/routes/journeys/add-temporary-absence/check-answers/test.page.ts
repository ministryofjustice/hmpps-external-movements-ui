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

  async clickChangeLinkFor(heading: string) {
    return this.page
      .getByRole('link', { name: new RegExp(`Change\\s*${heading}`, 'i') })
      .first()
      .click()
  }
}
