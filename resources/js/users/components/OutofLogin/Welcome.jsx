import React from 'react'
import Register from './Register'
import { useSelector } from 'react-redux'

function Welcome() {
  const id = useSelector((state) => state.user.id);
  return (
    <div className='w-full h-full'>
      <Register />
    </div>
  )
}

export default Welcome
