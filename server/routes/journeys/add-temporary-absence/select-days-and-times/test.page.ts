import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class FreeformSelectDaysPage extends BaseTestPage {
  async verifyContent(dateRange: string, backUrl: RegExp) {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/select-days-and-times/,
      title: 'Enter absence dates - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: `Enter absence dates and times for ${dateRange} (optional)`,
      backUrl,
    })
  }

  releaseDateField(idx: number) {
    return this.textbox('Release date').nth(idx)
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
