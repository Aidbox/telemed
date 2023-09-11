import { Link } from '../Link'

interface Props {
  list: Array<{ path: string, active: boolean, name: string }>
}

export const Breadcrumbs = ({ list }: Props) => {
  return (
    <nav aria-label='breadcrumb'>
      <ol className='breadcrumb'>
        {list.map(item => (
          <li
            key={item.name}
            className={`breadcrumb-item ${item.active ? 'active' : ''}`}
          >
            {item.active ? <span style={{ cursor: 'default' }}>{item.name}</span> : <Link to={item.path}>{item.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
