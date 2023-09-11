import { useUnit } from 'effector-react'
import React from 'react'

import ChatIcon from '../../assets/Chat.svg'
import ExitIcon from '../../assets/Exit.svg'
import GroupIcon from '../../assets/Group.svg'
import Logo from '../../assets/logo.svg'
import PhrIcon from '../../assets/Phr.svg'
import ProfileIcon from '../../assets/Profile.svg'
import VisitsIcon from '../../assets/Visits.svg'

// import { useController } from '../../lib/components/ControllerLayer'
// import { AppController } from '../AppController'

// import { ErrorBoundary, ErrorFallback } from './Errors/ErrorBoundary'
// import ExitIcon from '../../icons/'

import { LOG_OUT, Session } from '../../service/session'
import { Link } from '../Link'

import css from './Layout.module.css'

interface Props { children: React.ReactNode }

export function Layout ({ children }: Props) {
  const session = useUnit(Session)

  return (
    <div className={css.layout}>
      <div className={css.aside}>
        <div className={css['link-list']}>
          <Link className={css.link} to='/'>
            <Logo width={44} height={44} />
          </Link>

          {!session.isAdmin && <Link className={css.link} to='/'>
            <VisitsIcon width={32} height={32} />
          </Link>}

          {!session.isAdmin && <Link className={css.link} to='/'>
            <ChatIcon width={32} height={32} />
          </Link>}

          {!session.isAdmin && <Link className={css.link} to='/'>
            <PhrIcon width={32} height={32} />
          </Link>}

          {!session.isAdmin && <Link className={css.link} to='/profile'>
            <ProfileIcon width={32} height={32} />
          </Link>}

          {session.isAdmin && <Link className={css.link} to='/email-notifications'>
            <GroupIcon width={32} height={32} />
          </Link>}

          {session.isAdmin && <Link className={css.link} to='/reports'>
            <GroupIcon width={32} height={32} />
          </Link>}

          {session.isAdmin && <Link className={css.link} to='/users'>
            <GroupIcon width={32} height={32} />
          </Link>}

          <Link
            className={css.link} onClick={() => LOG_OUT()}
            to='/auth/sign-in'
          >
            <ExitIcon width={32} height={32} />
          </Link>
        </div>

        <div className={css.logout}>
          {/* <ExitIcon height='32px' width='32px' /> */}
        </div>
      </div>

      <div className={css.content}>
        {children}
        {/* <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}> */}
        {/*  {children} */}
        {/* </ErrorBoundary> */}
      </div>
    </div>
  )
}

// const Component = () => {
//   // activeStyle='activeLink'
//   return (
//     <div className={css.link} key={route.path}>
//       <Link to={route.path}>
//         {route.icon ? <route.icon height='32px' width='32px' /> : null}
//       </Link>
//     </div>
//   )
// }
