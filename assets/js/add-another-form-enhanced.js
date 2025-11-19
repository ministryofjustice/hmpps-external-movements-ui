import * as mojFrontend from '@ministryofjustice/frontend'

export const initAddAnotherForm = () => {
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
}
