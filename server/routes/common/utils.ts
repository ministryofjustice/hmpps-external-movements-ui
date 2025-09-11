import { components } from '../../@types/externalMovements'

export const absenceCategorisationMapper = ({
  code,
  description,
  hintText,
}: components['schemas']['AbsenceCategorisation']) => ({
  value: code,
  text: description,
  hint: hintText ? { text: hintText } : undefined,
})
