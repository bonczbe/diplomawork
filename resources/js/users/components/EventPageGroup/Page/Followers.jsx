import axios from 'axios'
import React, { useState, useEffect } from 'react'
import Member from '../../UseMoreFromMOreComponents/Member'

function Followers({ id, loggedInID }) {
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)
/* This is a React hook called `useEffect` that is used to perform side effects in functional
components. In this case, it is making an HTTP GET request to the `/api/pagehelper/followers/`
endpoint with the `id` parameter and setting the state of `followers` and `loading` based on the
response. The `useEffect` hook is triggered whenever the `loggedInID` parameter changes. */

  useEffect(() => {
    axios.get('/api/pagehelper/followers/' + id).then((response) => {
      setFollowers(response.data)
      setLoading(false)
    }).catch((error) => console.log(error))
  }, [loggedInID])
  return (
    <div className='w-full h-full pt-3' style={{
      WebkitColumnCount: 1, MozColumnCount: 1, columnCount: 1,
      WebkitColumnWidth: "100%", MozColumnWidth: "100%", columnWidth: "100%"
    }}>
      {
        (followers.length > 0) ? followers.map((member) => {
          return <Member key={member.userID} member={member.userID} userID={loggedInID} connectionID={member.id} />
        })
          : (loading === false) ? <div className="w-full text-center" style={{ fontSize: "x-large" }}>
            There is no Follower
          </div> : null
      }
    </div>
  )
}

export default Followers
