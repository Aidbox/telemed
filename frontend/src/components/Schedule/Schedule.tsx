import clsx from 'clsx'
import format from 'date-fns/format'
import React, { useCallback, useState } from 'react'
import { IMaskInput } from 'react-imask'

import { RulesStore, Dow, Time, WeekDays } from '../../service/schedule'
import Button from '../Button'
import { Header } from '../Layout/Header'

import css from './Schedule.module.css'

const daysOfWeek = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday'
}

interface Props {
  onSave: (rules: Array<{ daysOfWeek: [WeekDays], availableEndTime: string, availableStartTime: string, duration: number }>) => void,
  onFetch?: () => void,
  rules: Partial<RulesStore>
}

const alignRules = (rules: Partial<RulesStore>, data: { dow: Dow, time: Time }, status: 'create' | 'update') => {
  const keys = Object.keys(data.dow) as Array<WeekDays>

  if (status === 'create') {
    keys.forEach(key => {
      if (data.dow[key]) { rules[key] = { times: [...rules[key]?.times || [], data.time] } }
    })
  }

  if (status === 'update') {
    keys.forEach(key => {
      const currentrule = rules[key]

      if (currentrule !== undefined) {
        const index = currentrule.times.map(item => JSON.stringify(item)).indexOf(JSON.stringify(ruleSnapshot))

        if (index !== undefined && data.dow[key] && index > -1) {
          currentrule.times[index] = { ...data.time }
        }

        if (index !== undefined && data.dow[key] && index === -1) {
          currentrule.times.push({ ...data.time })
        }

        // if (index !== undefined && !data.dow[key] && index > -1) {}
      }

      if (currentrule === undefined && data.dow[key]) {
        rules[key] = { times: [{ ...data.time }] }
      }
    })
  }

  return transformRules(rules)
}

const theSameTimeRange = (time1: Time, time2: Time) => {
  return String(time1.start) === String(time2.start) &&
    String(time1.end) === String(time2.end) &&
    String(time1.duration) === String(time2.duration)
}

const deleteRules = (rules: Partial<RulesStore>, removeData: { dow: Dow, time: Time}) => {
  const keys = Object.keys(rules) as Array<WeekDays>
  const time = { ...removeData.time, duration: Number(removeData.time.duration) }

  keys.forEach(key => {
    const index = rules[key]?.times.map(item => JSON.stringify(item)).indexOf(JSON.stringify(time))
    if (index !== undefined && index > -1) rules[key]?.times.splice(index, 1)
  })

  return transformRules(rules)
}

function convertTimeToZeroOffset (time: string) {
  const date = new Date(`01-01-2020 ${time}:00`)
  const dateZeroTimezone = new Date(date.getTime() + date.getTimezoneOffset() * 1000 * 60)
  return format(dateZeroTimezone, 'HH:mm:ss')
}

const transformRules = (rules: Partial<RulesStore>) => {
  const body: Array<{ daysOfWeek: [WeekDays], availableEndTime: string, availableStartTime: string, duration: number }> = []
  const keys = Object.keys(rules) as Array<WeekDays>

  keys.forEach(key => {
    const times = rules[key]?.times;

    (times || []).forEach(time => {
      const start = convertTimeToZeroOffset(time.start)
      const end = convertTimeToZeroOffset(time.end)
      const exist = body.find(item =>
        item.availableEndTime === end &&
        item.availableStartTime === start &&
        item.duration === Number(time.duration)
      )

      if (exist) exist.daysOfWeek.push(key)
      else {
        body.push({
          daysOfWeek: [key],
          duration: Number(time.duration),
          availableStartTime: start,
          availableEndTime: end
        })
      }
    })
  })

  return body
}

const defaultDow = { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false }
const defaultTimeRange = { start: '', end: '', duration: 0 }
let ruleSnapshot: Time = { start: '', end: '', duration: 0 }

const Schedule = ({ rules, onSave }: Props) => {
  const [isShow, setShow] = useState(false)
  const [crossError, setCrossError] = useState(false)
  const [isExisted, setExisted] = useState(false)
  const [rule, setRule] = useState<{ dow: Dow, timeRange: Time }>({
    dow: defaultDow,
    timeRange: defaultTimeRange
  })

  const handleChange = (name: keyof Time, value: string) => {
    setRule({ ...rule, timeRange: { ...rule.timeRange, [name]: value } })
  }

  const checkCrossDates = useCallback((dow: Dow, time: Time) => {
    if (rules) {
      let isResult = false
      const rulesKeys = Object.keys(rules) as Array<WeekDays>

      rulesKeys.forEach((key) => {
        if (key in dow && dow[key]) {
          if (!isResult) {
            isResult = (rules[key]?.times || []).some(range => {
              const a = (time.start >= range.start && time.start < range.end)
              const b = time.start > time.end
              const c = time.end > range.start && time.end <= range.end
              const isOrigin = theSameTimeRange(ruleSnapshot, range)
              return !isOrigin && (a || b || c)
            })
          }
        }
      })
      setCrossError(isResult)
      return !isResult
    }

    return true
  }, [rules])

  const clearChoices = () => {
    setRule({ timeRange: defaultTimeRange, dow: defaultDow })
    setShow(false)
    setExisted(false)
  }

  const deleteRule = () => {
    onSave(deleteRules(rules, { dow: rule.dow, time: rule.timeRange }))
    clearChoices()
  }

  const processSave = () => {
    if (rule.timeRange && checkCrossDates(rule.dow, rule.timeRange)) {
      onSave(alignRules(rules, { dow: rule.dow, time: rule.timeRange }, isExisted ? 'update' : 'create'))
      clearChoices()
    }
  }

  const prepareToModal = (time: Time) => {
    const response: { days: Array<WeekDays>, time: Time} = { days: [], time }
    const keys = Object.keys(rules) as Array<WeekDays>

    keys.forEach(key => {
      if (rules[key]?.times.find(item => theSameTimeRange(item, time))) {
        response.days.push(key)
      }
    })

    const newDow: { [key in WeekDays]?: boolean } = {};

    (Object.keys(rule.dow) as Array<WeekDays>).forEach(key => {
      if (response.days.find(d => d === key)) {
        newDow[key] = true
      }
    })

    setRule({ dow: { ...rule.dow, ...newDow }, timeRange: response.time })
    setCrossError(false)
    setShow(true)
    setExisted(true)
    ruleSnapshot = response.time
  }

  const timeDoesExist = (Object.keys(rule.timeRange) as Array<keyof Time>).every(key => String(rule.timeRange[key]).length)
  const dowDoesExist = (Object.keys(rule.dow) as Array<keyof Dow>).some(key => rule.dow[key])

  return <>
    <Header>Availability</Header>
    <div>
      {rules
        ? <>
          {(Object.keys(daysOfWeek) as Array<WeekDays>).map(key => {
            const item = rules[key]
            return <div className={css.item} key={key}>
              <div className={css.day}>{daysOfWeek[key]}</div>
              <div className={css.times}>
                {item?.times && item.times.map(time => {
                  return (
                    <div
                      className={JSON.stringify(time) === JSON.stringify(rule.timeRange) ? clsx(css.time, css.edit) : css.time}
                      onClick={() => { prepareToModal(time) }}
                      key={time.start}
                    >
                      {time.start} - {time.end}
                    </div>
                  )
                })}

                <div className={clsx(css.time, css.new)} onClick={() => { setShow(true); setRule({ ...rule, dow: { ...rule.dow, [key]: true } }) }}>+</div>
              </div>
            </div>
          })}
        </>
        : <div>Loading...</div>}
    </div>

    {isShow &&
      <Modal onClose={() => { clearChoices(); setShow(false) }}>
        <div>
          <div className={css['start-end']}>
            <IMaskInput
              placeholder='08:00' mask='00:00'
              value={rule.timeRange.start} name='start'
              style={{ padding: '0 .5rem', width: '90px', textAlign: 'center' }}
              unmask={false}
              onAccept={(value) => handleChange('start', value)}
            />
            <IMaskInput
              placeholder='17:00' mask='00:00'
              value={rule.timeRange.end} name='end'
              style={{ padding: '0 .5rem', width: '90px', textAlign: 'center' }}
              unmask={false}
              onAccept={(value) => handleChange('end', value)}
            />
            <IMaskInput
              placeholder='Duration' mask={'00'}
              value={(rule.timeRange.duration || '').toString()} name='duration'
              style={{ padding: '0 .5rem', width: '90px', textAlign: 'center' }}
              unmask={false}
              onAccept={(value) => handleChange('duration', value)}
            />
          </div>

          <div className={css.dow}>
            {(Object.keys(rule.dow) as Array<keyof Dow>).map((key) => {
              return (
                <div
                  key={key} onClick={() => setRule({ ...rule, dow: { ...rule.dow, [key]: !rule.dow[key] } })}
                  className={clsx(css['dow-item'], rule.dow[key] && css.active)}
                >
                  {key}
                </div>
              )
            })}
          </div>

          {crossError &&
            <div className='mt-2'>
              <span style={{ color: 'red', fontWeight: 'bold' }}>You have cross dates. Please fix the issue</span>
            </div>}

          <div className='mt-3'>
            <Button
              variant='primary' size='sm'
              onClick={() => processSave()}
              disabled={!(timeDoesExist && dowDoesExist)}
            >Save</Button>

            <Button
              variant='secondary' className='ml-2'
              size='sm' onClick={() => clearChoices()}
            >Clear</Button>

            {isExisted &&
              <Button
                variant='secondary' style={{ color: 'red' }}
                className='ml-2' size='sm'
                onClick={deleteRule}
              >Delete rule</Button>}
          </div>
        </div>
      </Modal>
    }
  </>
}

const Modal = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => {
  return <div className={css.wrapper}>
    <div className={css.modal}>
      <div className={css.header}>
        <button onClick={onClose}>Close</button>
      </div>
      <div className={css.body}>{children}</div>
    </div>
  </div>
}

export default Schedule
