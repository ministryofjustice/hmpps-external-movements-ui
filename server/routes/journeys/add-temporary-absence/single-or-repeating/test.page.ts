import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class SingleOrRepeatingPage extends BaseTestPage {
  async verifyContent(backUrl: RegExp) {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/single-or-repeating/,
      title: 'Select single or repeating absence - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Is this a single or repeating absence?',
      backUrl,
    })
  }

  singleRadio() {
    return this.radio('Single')
  }

  repeatingRadio() {
    return this.radio('Repeating')
  }
}
