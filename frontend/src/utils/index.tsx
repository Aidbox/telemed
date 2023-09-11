// @ts-nocheck
import { HumanName } from 'aidbox/types'
import { format, parseISO } from 'date-fns'

export function constructReadableName (name: HumanName | undefined) {
  if (!name) return ''

  let result = ''

  if ('prefix' in name) result = name.prefix[0] + ' '
  if ('given' in name) result = result + name.given[0] + ' '
  if ('family' in name) result = result + name.family

  return result
}

export function sortDates (data) {
  const dates = []

  data.forEach((r) => {
    const { start, end } = r
    const day = format(
      parseISO(start, { additionalDigits: 2 }),
      'yyyy-MM-dd'
    )
    const exist = dates.find((d) => d.date === day)
    if (exist) {
      exist.times.push({ start, end })
    } else {
      dates.push({ date: day, times: [{ start, end }] })
    }
  })

  return dates
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      ...item,
      times: item.times.sort((a, b) => new Date(a.start) - new Date(b.start))
    }))
}

export function deepMerge (...objects) {
  const isObject = (obj) => obj && typeof obj === 'object'

  function deepMergeInner (target, source) {
    Object.keys(source).forEach((key) => {
      const targetValue = target[key]
      const sourceValue = source[key]

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue)
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = deepMergeInner(Object.assign({}, targetValue), sourceValue)
      } else {
        target[key] = sourceValue
      }
    })

    return target
  }

  if (objects.length < 2) {
    throw new Error('deepMerge: this function expects at least 2 objects to be provided')
  }

  if (objects.some(object => !isObject(object))) {
    throw new Error('deepMerge: all values should be of type "object"')
  }

  const target = objects.shift()
  let source

  while (source = objects.shift()) {
    deepMergeInner(target, source)
  }

  return target
}

export function cloneArray (value) {
  let newArray
  if (value && value.length) {
    newArray = []
    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] === 'object') {
        newArray[i] = Array.isArray(value[i]) ? cloneArray(value[i]) : cloneObject(value[i])
      } else {
        newArray[i] = value[i]
      }
    }
  } else if (value === null) {
    newArray = null
  }
  return newArray
}

export function deepClone (source) {
  return ({
    object: cloneObject,
    function: cloneFunction
  }[typeof source] || clonePrimitive)(source)()
}

function cloneObject (source) {
  return (Array.isArray(source)
      ? () => source.map(deepClone)
      : clonePrototype(source, cloneFields(source, simpleFunctor({})))
  )
}

function cloneFunction (source) {
  return cloneFields(source, simpleFunctor(function () {
    return source.apply(this, arguments)
  }))
}

function clonePrimitive (source) {
  return () => source
}

function simpleFunctor (value) {
  return mapper => mapper ? simpleFunctor(mapper(value)) : value
}

function makeCloneFieldReducer (source) {
  return (destinationFunctor, field) => {
    const descriptor = Object.getOwnPropertyDescriptor(source, field)
    return destinationFunctor(destination => Object.defineProperty(destination, field, 'value' in descriptor
? {
      ...descriptor,
      value: deepClone(descriptor.value)
    }
: descriptor))
  }
}

function cloneFields (source, destinationFunctor) {
  return (Object.getOwnPropertyNames(source)
      .concat(Object.getOwnPropertySymbols(source))
      .reduce(makeCloneFieldReducer(source), destinationFunctor)
  )
}

function clonePrototype (source, destinationFunctor) {
  return destinationFunctor(destination => Object.setPrototypeOf(destination, Object.getPrototypeOf(source)))
}
