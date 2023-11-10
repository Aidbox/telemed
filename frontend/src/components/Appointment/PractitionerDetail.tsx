import { Practitioner } from 'aidbox/types'
import clsx from 'clsx'
import { addMinutes } from 'date-fns'
import { useUnit } from 'effector-react'
import React, { useState, useEffect } from 'react'

import profile from '../../assets/profile-base.png'
import Button from '../../components/Button'
import TextArea from '../../components/TextArea'
import { CREATE_APPOINTMENT } from '../../service/appointment'
import { Session } from '../../service/session'
import { constructReadableName } from '../../utils'

import classes from './FindPractitioner.module.css'
import { FindPractitionerSchedule } from './PractitionerSchedule'
interface Props { practitioner: Practitioner | undefined }

export function FindPractitionerDetails (props: Props) {
  const { practitioner } = props
  const session = useUnit(Session)

  const [currentTime, setCurrentTime] = useState<{ start: string, date: string, duration: string } | undefined>(undefined)
  const [chief, setChief] = useState('')

  useEffect(() => { setCurrentTime(undefined) }, [practitioner])

  const practitionerName = practitioner?.name?.[0]

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (session.user && practitioner?.id && currentTime) {
      const nativeStartDate = new Date(currentTime.start)
      CREATE_APPOINTMENT({
        patient: session.user.link[0].link.id,
        practitioner: practitioner.id,
        start: nativeStartDate.toISOString().split('.')[0] + 'Z',
        end: addMinutes(nativeStartDate, parseInt(currentTime.duration)).toISOString().split('.')[0] + 'Z',
        chief
      })
    }
  }

  const getSpeciality = (data: Practitioner['qualification']) => {
    const speciality = data?.[0]
    return speciality?.code.text || 'unknown'
  }

  return (
    <form onSubmit={submit}>
      <div className={classes.details}>
        <div className={classes.badge}>
          <img
            className={classes.profileImage} src={profile}
            alt='profile'
          />
          <div className={classes.names}>
            <strong>{practitionerName ? constructReadableName(practitionerName) : 'N/A'}</strong>
            <span className='text-muted' style={{ fontSize: '16px' }}>
              {getSpeciality(practitioner?.qualification)}
            </span>
          </div>
        </div>
      </div>
      <div className='font-weight-bold mt-5 mb-2'>Select an available time</div>

      <FindPractitionerSchedule slot={currentTime} selectSlot={setCurrentTime} />

      <div className='mb-4'>
        <p className='mt-3 mb-2 font-weight-bold'>Chief complaint</p>
        <TextArea
          value={chief}
          onChange={(e) => setChief(e.target.value)}
          className={clsx(['form-control', 'form-control-lg'])}
          rows={5}
          placeholder='Provide description...'
        />
      </div>

      <Button
        full type='submit'
        variant='primary'
        disabled={currentTime === undefined || chief === ''}
      >
        Create appointment
      </Button>
    </form>
  )
}
