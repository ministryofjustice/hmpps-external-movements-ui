import * as mojFrontend from '@ministryofjustice/frontend'

mojFrontend.DatePicker.prototype.formattedDateFromString = function (dateString, fallback = new Date()) {
  let formattedDate = null
  // Accepts d/m/yyyy and dd/mm/yyyy
  const dateFormatPattern = /(\d{1,2})([-/,. ])(\d{1,2})\2(\d{4})/
  if (!dateFormatPattern.test(dateString)) return fallback
  const match = dateFormatPattern.exec(dateString)
  const day = match[1]
  const month = match[3]
  const year = match[4]
  formattedDate = new Date(Number(year), Number(month) - 1, Number(day))
  if (formattedDate instanceof Date && Number.isFinite(formattedDate.getTime())) {
    return formattedDate
  }
  return fallback
}

mojFrontend.DatePicker.prototype.setMinAndMaxDatesOnCalendar = function () {
  if (this.config.minDate) {
    this.minDate = this.formattedDateFromString(this.config.minDate, null)
    if (this.minDate) this.minDate.setDate(this.minDate.getDate() + 1)
    if (this.minDate && this.currentDate < this.minDate) {
      this.currentDate = this.minDate
    }
  }
  if (this.config.maxDate) {
    this.maxDate = this.formattedDateFromString(this.config.maxDate, null)
    if (this.maxDate && this.currentDate > this.maxDate) {
      this.currentDate = this.maxDate
    }
  }
}

mojFrontend.DatePicker.prototype.openDialog = function () {
  this.$dialog.hidden = false
  this.$dialog.classList.add('moj-datepicker__dialog--open')
  this.$calendarButton.setAttribute('aria-expanded', 'true')

  // position the dialog
  // if input is wider than dialog pin it to the right
  if (this.$input.offsetWidth > this.$dialog.offsetWidth) {
    this.$dialog.style.right = `0px`
  }
  this.$dialog.style.top = `${this.$input.offsetHeight + 3}px`

  // get the date from the input element
  this.inputDate = this.formattedDateFromString(this.$input.value)

  if (this.minDate && this.minDate > this.inputDate) this.inputDate = new Date(this.minDate)
  if (this.maxDate && this.maxDate < this.inputDate) this.inputDate = new Date(this.maxDate)

  this.currentDate = this.inputDate
  this.currentDate.setHours(0, 0, 0, 0)
  this.updateCalendar()
  this.setCurrentDate()
}
