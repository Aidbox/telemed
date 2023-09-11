import format from 'date-fns/format'
import { useUnit } from 'effector-react'
import React, { useState } from 'react'

import RightArrowIcon from '../../assets/RightArrow.svg'
import { PractitionerSchedule } from '../../service/appointment'

import css from './FindPractitioner.module.css'

interface Props {
  slot: { start: string, date: string, duration: string } | undefined,
  selectSlot: (slot: { start: string, date: string, duration: string }) => void
}

export function FindPractitionerSchedule ({ slot, selectSlot }: Props) {
  const [currentElement, setCurrentElement] = useState(0)

  const schedule = useUnit(PractitionerSchedule)

  console.log(schedule)

  if (!schedule.length) return <div>Haven't available slot</div>

  const PrevArrow = (
    <div className={css.back} onClick={() => setCurrentElement(currentElement - 1)}>
      <RightArrowIcon height='16' />
    </div>
  )

  const NextArrow = (
    <div className={css.go} onClick={() => { setCurrentElement(currentElement + 1) }}>
      <RightArrowIcon height='16' />
    </div>
  )

  const PrevPlaceholder = <div className={[css.go, css.disableHover].join(' ')} />
  const NextPlaceholder = <div className={[css.back, css.disableHover].join(' ')} />

  return (
    <div className={css.availability}>
      <div className={css.dateChoose}>
        {currentElement !== 0 ? PrevArrow : (NextPlaceholder)}

        <span className={css.date}>
          {format(new Date(schedule[currentElement].date), 'LLLL dd, yyyy ')}
        </span>

        {currentElement !== schedule.length - 1 ? NextArrow : PrevPlaceholder}
      </div>

      <div className={css.slotList}>
        {schedule[currentElement].times.map((t) => (
          <div
            key={t.start}
            onClick={() => selectSlot({ start: t.start, date: schedule[currentElement].date, duration: t.duration })}
            className={[css.slot, slot?.date === schedule[currentElement].date && slot?.start === t.start && css.active].filter(Boolean).join(' ')}
          >
            <div className={css.time}>
              <span>{format(new Date(t.start), 'HH:mm')}</span>
              <span className={css.interval}>
                {t.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
