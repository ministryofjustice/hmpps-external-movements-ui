import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class RotatingReleaseReturnTimesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-temporary-absence\/rotating-release-return-times/,
      title: 'Enter rotating pattern release and return times - Add a temporary absence - DPS',
      caption: 'Create a Temporary Absence',
      heading: 'Enter the release and return times for this pattern',
      backUrl: /select-same-times/,
    })
  }

  timeEntry(index: number, segment: 'release' | 'return', cronoUnit: 'Hour' | 'Minute') {
    return this.page.locator(`[id="times[${index}][${segment}${cronoUnit}]"]`)
  }

  errorReturnBeforeRelease() {
    return this.page.getByRole('link', { name: 'The return time must come after the release time' })
  }

  errorEmptyReleaseTime() {
    return this.page.getByRole('link', { name: 'Enter a release time' })
  }

  errorEmptyReturnTime() {
    return this.page.getByRole('link', { name: 'Enter a return time' })
  }

  errorInvalidReleaseTime() {
    return this.page.getByRole('link', { name: 'Enter a valid release time' })
  }

  errorInvalidReturnTime() {
    return this.page.getByRole('link', { name: 'Enter a valid return time' })
  }
}
