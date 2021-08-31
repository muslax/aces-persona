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

/**
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
 export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateGPQSequence(length) {
  const array = []
  for (let i = 0; i < length; i++) {
    array.push(i + 1)
  }

  return shuffle(array).join(" ")
}

export function generateMATESequence(seeds) {
  const keys = shuffle(Object.keys(seeds))
  const array = []
  keys.forEach(k => {
    const items = seeds[k]
    items.forEach(i => {
      array.push(i)
    })
  })

  // let index = 1
  // const sequence = {}
  // array.forEach(item => {
  //   sequence[index] = item
  //   index++
  // })

  // return sequence
  return array.join(" ")
}

