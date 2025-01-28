import React from 'react'
import Component1 from '../components/Component1'
import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className='text-4xl bg-green-200 p-4 mt-64 animate-pulse'>
        HomePage
        <Component1 />
        <Link to='/SignIn'>Sign In</Link>
    </div>
  )
}

export default HomePage