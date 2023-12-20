import React from 'react'
import Reports from './Report/Reports'

/**
 * The function returns a React component that renders a Reports component within a div with a full
 * width and height.
 * @returns A React component that renders a div with a class name of "flex w-full h-full" and a child
 * component called Reports.
 */
function LoggedInView() {
  return (
    <div className='flex w-full h-full'>
      <Reports />
    </div>
  )
}

export default LoggedInView
