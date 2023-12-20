import axios from 'axios'
import React, { useState, useEffect } from 'react'
import Member from '../../UseMoreFromMOreComponents/Member'

export function Members({ id, loggedInID, role, refresh }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  /* `useEffect` is a hook in React that allows you to perform side effects in functional components.
  In this code, `useEffect` is used to fetch data from an API endpoint using Axios when the
  component mounts or when the `loggedInID` or `refresh` props change. Once the data is fetched, it
  updates the state of the `members` array using the `setMembers` function and sets the `loading`
  state to `false` using the `setLoading` function. */
  useEffect(() => {
    axios.get('/api/eventshelper/members/' + id).then((response) => {
      setMembers(response.data)
      setLoading(false)
    }).catch((error) => console.log(error))
  }, [loggedInID, refresh])
  return (
    <div className='w-full h-full pt-3' style={{
      WebkitColumnCount: 1, MozColumnCount: 1, columnCount: 1,
      WebkitColumnWidth: "100%", MozColumnWidth: "100%", columnWidth: "100%"
    }}>
      {
        (members.length > 0) ? members.map((member) => {
          if (role < 3) {
            return (member.role <= role) ? <Member key={member.userID} member={member.userID} userID={loggedInID} /> : null
          } else {
            return (member.role == role) ? <Member key={member.userID} member={member.userID} userID={loggedInID} /> : null
          }
        })
          : (loading === false) ? <div className="w-full text-center" style={{ fontSize: "x-large" }}>
            There is no Follower
          </div> : null
      }
    </div>
  )
}

export default Members
