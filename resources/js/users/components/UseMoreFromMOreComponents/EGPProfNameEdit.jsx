import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
//EGP means Event-Group-Page component where only the profile picture, name visible
//and you can go to the edit page and on the main page of the specific event for example
function EGPProfNameEdit({ dataID, isOwn, type }) {
  const [data, setData] = useState()

  useEffect(() => {
    axios.get('/api/' + type + '/show/' + dataID).then((res) => {
      if (res.status === 200) {
        setData(res.data)
      }
    }).catch((err) => {
      console.log(err)
    })
  }, [])
  return (data) ? (
    <div className='w-fit pb-3'>
      <Link to={'/' + type + 's/' + data.name + '/' + data.id} className="float-left w-fit">
        <img src={data.ProfilePicURI.profilePicURI} alt={"Profile Picture of: " + data.name} className=" h-10 w-auto float-left pr-3" />
        <span className='leading-10' style={{ whiteSpace: "pre-wrap" }}>
          {"Name: " + data.name}
        </span>
      </Link>
      {(isOwn) ?
        <Link to={"/" + type + "s/settings/" + data.name + "/" + data.id} className="pl-3">
          <span className='leading-10'>
            Edit
          </span>
        </Link>
        : null
      }
    </div>
  ) : null
}

export default EGPProfNameEdit
