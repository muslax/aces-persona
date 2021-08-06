import { format } from "date-fns"
import { id } from "date-fns/locale"

export function formatIDDate(date, formatStr = 'PP') {
  return format(date, formatStr, { locale: id })
}

export function pick(obj, ...keys) {
  const ret = {}
  keys.forEach((key) => {
    ret[key] = obj[key]
  })

  return ret
}

export function generatePOSTData(data) {
  return {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(data)
  }
}

