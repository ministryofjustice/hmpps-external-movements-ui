import Sortable from 'sortablejs'

export const initSortableList = () => {
  const sortButton = document.querySelector('.sortable-list-button')
  if (sortButton) {
    sortButton.classList.remove('govuk-!-display-none')

    const saveButton = document.querySelector('.sortable-list-save-button')
    const hint = document.querySelector('.sortable-list-hint')

    const sortableList = document.querySelector('.sortable-list')

    sortButton.addEventListener('click', evt => {
      evt.preventDefault()
      sortButton.classList.add('govuk-!-display-none')
      if (hint) hint.classList.remove('govuk-!-display-none')
      saveButton.classList.remove('govuk-!-display-none')

      sortableList.querySelectorAll('button').forEach(el => el.remove())

      Sortable.create(sortableList, {
        animation: 150,
        ghostClass: 'dragged-item',
      })
    })
  }
}
