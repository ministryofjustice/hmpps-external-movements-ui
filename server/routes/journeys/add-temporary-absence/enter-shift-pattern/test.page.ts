import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class EnterShiftPatternPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/enter-shift-pattern/,
      title: 'Enter shift pattern - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Enter a shift-type pattern for this absence',
      backUrl: /repeating-pattern/,
    })
  }

  numberInput(idx: number = 0) {
    return this.textbox('Number of days').nth(idx)
  }

  shiftType(idx: number = 0) {
    return this.dropdown('Shift type').nth(idx)
  }

  addAnother() {
    return this.button('Add another row')
  }

  remove(idx: number = 0) {
    return this.button('Remove').nth(idx)
  }

  startHourField(idx: number) {
    return this.textbox('Hour').nth(idx * 2)
  }

  startMinuteField(idx: number) {
    return this.textbox('Minute').nth(idx * 2)
  }

  returnHourField(idx: number) {
    return this.textbox('Hour').nth(idx * 2 + 1)
  }

  returnMinuteField(idx: number) {
    return this.textbox('Minute').nth(idx * 2 + 1)
  }
}
