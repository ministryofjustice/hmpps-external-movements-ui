export const initShiftPreviewToggle = () => {
  document.querySelectorAll('.shift-preview').forEach(preview => {
    let previewType
    const setPreviewType = type => {
      previewType = type
      if (previewType === 'CALENDAR') {
        preview.querySelector('.mc-toggle-text').innerHTML = 'Change to table view'
        preview.querySelector('.preview-table').classList.add('govuk-!-display-none')
        preview.querySelector('.preview-calendar').classList.remove('govuk-!-display-none')
      } else {
        preview.querySelector('.mc-toggle-text').innerHTML = 'Change to calendar view'
        preview.querySelector('.preview-table').classList.remove('govuk-!-display-none')
        preview.querySelector('.preview-calendar').classList.add('govuk-!-display-none')
      }
    }

    setPreviewType('CALENDAR')
    preview.querySelector('.mc-toggle-button').addEventListener('click', evt => {
      evt.preventDefault()
      setPreviewType(previewType === 'CALENDAR' ? 'TABLE' : 'CALENDAR')
    })

    preview.classList.remove('govuk-!-display-none')
  })

  window.getUpdatePreviewHandler = getUpdatePreviewHandler
}

const DOW_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function* iterateCalendarDays(dateFrom, dateTo) {
  const currentDay = new Date(dateFrom)
  let currentMonth = currentDay.getMonth()

  let padStartLength = (currentDay.getDay() + 6) % 7

  if (padStartLength) {
    for (let i = padStartLength; i > 0; i--) {
      const day = new Date(dateFrom)
      day.setDate(day.getDate() - i)
      yield {
        month: currentMonth,
        date: day.getMonth() === currentMonth ? day.getDate() : '',
        inRange: false,
      }
    }
  }

  while (currentDay.toISOString().substring(0, 10) <= dateTo) {
    if (currentDay.getMonth() !== currentMonth) {
      let padStartLength = (currentDay.getDay() + 6) % 7
      if (padStartLength) {
        for (let i = 0; i < 7 - padStartLength; i++) {
          yield {
            month: currentMonth,
            date: '',
            inRange: false,
          }
        }

        for (let i = 0; i < padStartLength; i++) {
          yield {
            month: currentDay.getMonth(),
            date: '',
            inRange: false,
          }
        }
      }
    }
    currentMonth = currentDay.getMonth()
    yield {
      month: currentDay.getMonth(),
      date: currentDay.getDate(),
      inRange: true,
    }
    currentDay.setDate(currentDay.getDate() + 1)
  }

  const lastDate = new Date(dateTo)
  // pad end only if the last date is not the last day of the month
  if (new Date(lastDate.getTime() + 86400000).getDate() !== 1) {
    const padEndLength = (7 - lastDate.getDay()) % 7
    if (padEndLength) {
      for (let i = 1; i <= padEndLength; i++) {
        const day = new Date(dateTo)
        day.setDate(day.getDate() + i)
        yield {
          month: day.getMonth(),
          date: day.getMonth() === lastDate.getMonth() ? day.getDate() : '',
          inRange: false,
        }
      }
    }
  }
}

export const getUpdatePreviewHandler = (dateFrom, dateTo, shiftIteratorHandler) => () => {
  const shiftIterator = shiftIteratorHandler()
  const previewTableContainer = document.querySelector('.preview-table')
  previewTableContainer.innerHTML = ''
  const table = document.createElement('table')
  table.setAttribute('class', 'govuk-table govuk-!-margin-bottom-6')
  table.innerHTML =
    '<thead class="govuk-table__head"><tr class="govuk-table__row"><th class="govuk-table__header">Day</th><th class="govuk-table__header">Date</th><th class="govuk-table__header">Time In</th><th class="govuk-table__header">Time Out</th></tr></thead>'
  const tbody = document.createElement('tbody')
  tbody.setAttribute('class', 'govuk-table__body')

  let currentDay = new Date(dateFrom)
  let shiftTime = shiftIterator()
  while (currentDay.toISOString().substring(0, 10) <= dateTo) {
    const row = document.createElement('tr')
    row.setAttribute('class', 'govuk-table__row')
    const time = shiftTime.next().value
    const date = time ? currentDay.toISOString().substring(0, 10) : ''
    const startTime = time?.startTime ?? ''
    const returnTime = time?.returnTime ?? ''
    row.innerHTML = `<th scope="row" class="govuk-table__header">${DOW_NAMES[currentDay.getDay()]}</th><td class="govuk-table__cell">${date}</td><td class="govuk-table__cell">${startTime}</td><td class="govuk-table__cell">${returnTime}</td>`
    tbody.appendChild(row)
    currentDay.setDate(currentDay.getDate() + 1)
  }
  table.appendChild(tbody)
  previewTableContainer.appendChild(table)

  const calendar = document.querySelector('.preview-calendar')
  calendar.innerHTML = ''

  let month = undefined
  let monthTable = undefined
  let monthTbody = undefined
  let weekRow = []

  shiftTime = shiftIterator()

  for (const day of iterateCalendarDays(dateFrom, dateTo)) {
    if (day.month !== month) {
      if (month !== undefined && monthTable && monthTbody) {
        const monthHeading = document.createElement('h3')
        monthHeading.setAttribute('class', 'govuk-heading-s')
        monthHeading.innerHTML = MONTH_NAMES[month]
        calendar.appendChild(monthHeading)
        if (weekRow.length) {
          const row = document.createElement('tr')
          row.innerHTML = weekRow.join('')
          monthTbody.appendChild(row)
        }
        monthTable.appendChild(monthTbody)
        calendar.appendChild(monthTable)
      }
      month = day.month
      monthTable = document.createElement('table')
      monthTable.innerHTML =
        '<thead><tr><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th><th>SUN</th></tr></thead>'
      monthTbody = document.createElement('tbody')
      weekRow = []
    }
    const time = day.inRange ? shiftTime.next().value : undefined
    if (time) {
      weekRow.push(
        `<td><div>${day.date}</div><div class="middle">${{ DAY: 'Day shift', NIGHT: 'Night shift' }[time.type] ?? ''}</div><div class="middle">${time.startTime} - ${time.returnTime}</div></td>`,
      )
    } else {
      weekRow.push(`<td>${day.date}</td>`)
    }

    if (weekRow.length === 7) {
      const row = document.createElement('tr')
      row.innerHTML = weekRow.join('')
      monthTbody.appendChild(row)
      weekRow = []
    }
  }

  if (month !== undefined && monthTable && monthTbody) {
    const monthHeading = document.createElement('h3')
    monthHeading.setAttribute('class', 'govuk-heading-s')
    monthHeading.innerHTML = MONTH_NAMES[month]
    calendar.appendChild(monthHeading)
    if (weekRow.length) {
      const row = document.createElement('tr')
      row.innerHTML = weekRow.join('')
      monthTbody.appendChild(row)
    }
    monthTable.appendChild(monthTbody)
    calendar.appendChild(monthTable)
  }
}
