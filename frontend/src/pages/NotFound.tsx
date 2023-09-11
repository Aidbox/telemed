import { createRoute } from 'atomic-router'
import { Link } from 'atomic-router-react'
import React from 'react'

const route = createRoute()
const backToHomeRoute = createRoute()

const Page = () => {
  return (
    <div>
      <h1>This is 404 page</h1>
      <Link to={backToHomeRoute}>Go to posts</Link>
      <br />
      <br />
      <Link to='/asdfasdf'>Non-existing page</Link>
    </div>
  )
}

export const NotFound = {
  route,
  backToHomeRoute,
  Page
}
