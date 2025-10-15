import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import * as connectDps from '@ministryofjustice/hmpps-connect-dps-shared-items/dist/assets/js/all'
import Card from './card'
import { nodeListForEach } from './utils'
import './patch-datepicker'
import AutoComplete from './autocomplete'

govukFrontend.initAll()
mojFrontend.initAll()
connectDps.initAll()

var $cards = document.querySelectorAll('.card--clickable')
nodeListForEach($cards, function ($card) {
  new Card($card)
})

var $autoCompleteElements = document.getElementsByName('autocompleteElements')
nodeListForEach($autoCompleteElements, function ($autoCompleteElements) {
  new AutoComplete($autoCompleteElements)
})

Array.from(document.querySelectorAll('a')).forEach(link => {
  link.addEventListener('click', evt => {
    link.classList.add('disable-link')
    setTimeout(() => link.classList.remove('disable-link'), 1000)
  })
})

const anotherForm = document.querySelector('.add-another-form')
if (anotherForm) {
  new MutationObserver(_mutations => {
    document.querySelectorAll(`[data-module="moj-date-picker"]`).forEach(el => {
      el.removeAttribute('data-moj-date-picker-init')
      const wrapper = el.querySelector('.moj-datepicker__wrapper')
      wrapper.replaceWith(wrapper.querySelector('.moj-js-datepicker-input'))
      new mojFrontend.DatePicker(el)
    })
    anotherForm.dispatchEvent(new Event('components-init'))
  }).observe(anotherForm, {
    childList: true,
  })
}
