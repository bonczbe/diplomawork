import React from 'react'
import { Link } from 'react-router-dom'
/* This is a functional component in JavaScript React that takes in two props, `data` and `resetText`.
It returns a JSX element that renders a clickable link with a profile picture and name. The link's
destination is determined by the `data` prop, which contains information about the type of profile
(user or something else), the name, and the ID. The `resetText` prop is used as an onClick event
handler for the link. */
function ProfPicName({ data, resetText }) {
  return (
    <Link onClick={resetText} to={(data.type == "user") ? ("/users/" + data.tag) : (data.type + "s/" + data.name + "/" + data.id)}>
      <div className='w-full h-10 py-2 px-4  flex items-center'>
        <div className='w-fit float-left bg-profImage-bg-color mr-3 m-2 rounded-full shadow-smaller'>
          <img src={data.profileIMG.profilePicURI} className="h-10 rounded-full block" />
        </div>
        <span className='truncate leading-10'>
          {data.name}
        </span>
      </div>
    </Link>
  )
}

export default ProfPicName
