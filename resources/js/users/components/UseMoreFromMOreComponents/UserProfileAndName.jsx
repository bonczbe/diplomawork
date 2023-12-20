import axios from 'axios'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

function UserProfileAndName({ userId }) {
    const [user, setUser] = useState()
    useEffect(() => {
        axios.get('/api/usersNeeded/' + userId).then((res) => {
            setUser(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }, [])
    return (user != undefined) ? (
        <div className='w-full'>
            <Link to={"/users/" + user.tag} className="f-full">
                <img src={user.ProfilePicURI.profilePicURI} className=" h-10 w-auto float-left pr-3" alt='Profil Picture' />
                <span className='leading-10 truncate block'>
                    {user.firstName + " "}{(user.middleName != "null") ? <span>{user.middleName}{" "}</span> : ""}{user.lastName}
                </span>
            </Link>
        </div>
    ) : null
}

export default UserProfileAndName
