import clsx from 'clsx'
import React, { useState } from 'react'

import css from './Layout.module.css'

export function Tabs ({ children }: { children: React.ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const mapped = React.Children.toArray(children)
  console.log(activeIndex)

  const dynamicClasses = (index: number) => ({
    [css['tabs-container__tab']]: true,
    [css['tabs-container__tab--active']]: activeIndex === index
  })

  return (
    <div className={css['tabs-container']}>
      <ul className={css['tabs-container__header']}>
        {mapped.map((item, index) => {
          if (!React.isValidElement<{ name: string }>(item)) return undefined

          return (
            <li
              className={clsx(dynamicClasses(index))}
              onClick={() => setActiveIndex(index)} key={index}
            >
              {item.props.name}
            </li>
          )
        })}
      </ul>

      { mapped[activeIndex] }
    </div>
  )
}

export function Tab ({ children }: { name: string, children: React.ReactNode }) {
  return children
}
