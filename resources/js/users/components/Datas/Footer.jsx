import React from 'react'
import { Link } from 'react-router-dom'

/**
 * This is a React component that renders a footer with links to terms, a copyright notice, and a
 * message indicating that it is a pre-alpha version.
 * @returns A React component that renders a footer with three columns containing a link to the "Terms"
 * page, the current year and the text "Pre-alpha version!!!".
 */
function Footer({fromAdmin}) {
  return (
    <div className='w-full h-fit text-center bg-main-color text-main-text-color border-t border-left-rigth-text-color' style={{
      WebkitColumnCount: 3, MozColumnCount: 3, columnCount: 3,
      WebkitColumnWidth: "33%", MozColumnWidth: "33%", columnWidth: "33%"
    }}>
      <Link to={(fromAdmin)?"/supervisors/panel/terms":"/terms"}>Terms</Link>
      <section className='leadin-10'>
        &#169; {new Date().getFullYear()} Bubuus
      </section>
      <section className='leadin-10'>
        Pre-alpha version!!!
      </section>
    </div>
  )
}
export default Footer
