import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class EnterRotatingPatternPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/enter-rotating-pattern/,
      title: 'Enter rotating pattern - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Enter the pattern for this absence',
      backUrl: /repeating-pattern/,
    })
  }

  numberInput(idx: number = 0) {
    return this.textbox('Enter a number').nth(idx)
  }

  patternType(idx: number = 0) {
    return this.dropdown('Working pattern type').nth(idx)
  }

  addAnother() {
    return this.button('Add another row')
  }

  remove(idx: number = 0) {
    return this.button('Remove').nth(idx)
  }
}
