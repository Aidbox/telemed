import css from './Layout.module.css'

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

export function MasterDetailLayout ({ children, ...props }: Props) {
  return (
    <div className={css.container} {...props}>
      {children}
    </div>
  )
}

export function Master ({ children }: { children: React.ReactNode }) {
  return <div className={css.master}>{children}</div>
}

export function Detail ({ children }: { children: React.ReactNode }) {
  return <div className={css.detail}>{children}</div>
}
