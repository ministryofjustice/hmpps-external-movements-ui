import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class FreeformSelectDaysPage extends BaseTestPage {
  async verifyContent(backUrl: RegExp) {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/select-days-and-times/,
      title: 'Enter absence dates - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: /Month [0-9] of [0-9]: add absence occurrences taking place from \w+ [0-9]{1,2} to \w+ [0-9]{1,2} \w+/,
      backUrl,
    })
  }

  releaseDateField(idx: number) {
    return this.textbox('Start date').nth(idx)
  }

  returnDateField(idx: number) {
    return this.textbox('Return date').nth(idx)
  }

  releaseHourField(idx: number) {
    return this.textbox('Hour').nth(idx * 2)
  }

  releaseMinuteField(idx: number) {
    return this.textbox('Minute').nth(idx * 2)
  }

  returnHourField(idx: number) {
    return this.textbox('Hour').nth(idx * 2 + 1)
  }

  returnMinuteField(idx: number) {
    return this.textbox('Minute').nth(idx * 2 + 1)
  }
}
