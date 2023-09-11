import { Patient, Practitioner } from 'aidbox/types'
import React, { memo } from 'react'

import ProfileBase from '../../assets/avatar.png'
import EditIcon from '../../assets/Edit.svg'
import { User } from '../../service/session'
import { constructReadableName } from '../../utils'
import { Link } from '../Link'

import css from './UserInfo.module.css'

function UserInfo ({ user, resource } : { user: User, resource: Patient | Practitioner }) {
  const name = resource?.name?.[0] ? constructReadableName(resource.name[0]) : 'N/A'

  const { country, city, line } = resource?.address?.[0] || {}
  const userAddress = `${country || ''} ${city || ''} ${line?.[0] || ''}`
  const userPhone = (resource?.telecom || []).find(item => item.system === 'phone')
  const userEmail = (resource?.telecom || []).find(item => item.system === 'email')

  return (
    <div className={css.content}>
      <div className={css['head-block']}>
        <div className={css.avatar}>
          <img alt='profile photo' src={ProfileBase} />
        </div>

        <div className={css.names}>
          <span className={css.userName}>
            {name}
            <Link to='/profile/update'>
              <EditIcon style={{ width: '1rem', marginLeft: '0.2rem' }} />
            </Link>
          </span>
          <span className={css.roleName}>{user.data.roleName}</span>

          {resource?.id && (
            <dl className={css['user-attributes']}>
              <div className={css['user-attributes__row']}>
                <div className={css['user-attributes__row']}>
                  <dt>Gender:</dt>
                  <dd>{resource?.gender}</dd>
                </div>

                <div className={css['user-attributes__row']}>
                  <dt>Birthday:</dt>
                  <dd>{resource?.birthDate}</dd>
                </div>
              </div>

              <div className={css['user-attributes__row']}>
                <dt>Address:</dt>
                <dd>{userAddress}</dd>
              </div>

              <div className={css['user-attributes__row']}>
                <div className={css['user-attributes__row']}>
                  <dt>Phone:</dt>
                  <dd>{userPhone ? userPhone.value : ''}</dd>
                </div>

                <div className={css['user-attributes__row']}>
                  <dt>Email:</dt>
                  <dd>{userEmail ? userEmail.value : ''}</dd>
                </div>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(UserInfo)
