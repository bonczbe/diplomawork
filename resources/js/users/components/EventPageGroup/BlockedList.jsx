import { ConnectingAirportsOutlined } from '@mui/icons-material'
import axios from 'axios'
import { stringify } from 'postcss'
import React, { useEffect, useState } from 'react'
import { useAlert } from 'react-alert'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Member from '../UseMoreFromMOreComponents/Member'

function BlockedList({ spaceID, editType, place }) {
    const routeHelp = (place == 'page') ? "pagehelper" : (place == "group") ? "groupmember" : (place == "event") ? "eventshelper" : ""
    const [blocked, setBlocked] = useState([])
    const loggedInID = useSelector((state) => state.user.id)
    const [name, setName] = useState("")
    const [searched, setSearched] = useState([])
    const [loading, setLoading] = useState(true)
    const alerts = useAlert();
    const navigate = useNavigate();

    /* This is an `useEffect` hook that is used to fetch the list of blocked users from the server and
    update the state of the component accordingly. It runs whenever the `spaceID`, `place`, or
    `loggedInID` variables change. */
    useEffect(() => {
        axios.get('/api/' + routeHelp + '/blocked/' + spaceID).then((res) => {
            let datas = []
            res.data.map(data => {
                datas.push({
                    ...data,
                    name: data.firstName + " " + ((data.middleName) ? (data.middleName + " ") : "") + data.lastName
                })
            })
            setBlocked(datas)
            setLoading(false)
        }).catch((err) => {
            console.log(err)
            navigate('/404')
        })
    }, [spaceID, place, loggedInID])

    /* This is an `useEffect` hook that is used to update the `searched` state whenever the `name`
    state changes. If `name` is not an empty string, it sets a timeout of 500ms and then filters the
    `blocked` array to find users whose name starts with the value of `name`. The filtered array is
    then set as the new value of the `searched` state. If `name` is an empty string, the `searched`
    state is set to an empty array. The `useEffect` hook also returns a cleanup function that clears
    the timeout to prevent memory leaks. */
    useEffect(() => {
        if (name !== "") {
            const timeOutId = setTimeout(() => {
                setSearched(blocked.filter(user => user.name.indexOf(name) == 0))
            }, 500);
            return () => clearTimeout(timeOutId);
        } else {
            setSearched([])
        }
    }, [name])

    /**
     * The function unblocks a user by sending a delete request to the server and updating the searched
     * and blocked arrays.
     */
    const unBlock = (relID) => {
        if (routeHelp != "") {
            axios.delete('/api/' + routeHelp + '/delete/' + relID).then(() => {
                alerts.success("User unblocked!")
                setSearched(searched.filter(user => user.id != relID))
                setBlocked(blocked.filter((stillBlocked) => stillBlocked.id != relID))
            }).catch((err) => {
                alerts.error("Something went wrong")
                console.log(err)
            })
        }
    }
    return (
        <div className='w-full h-full'>
            <h1>Blocked users</h1>
            {(blocked.length > 0) ? <div className='w-full h-full'>
                <div className='w-full'>
                    <label className='pr-3'>Search by Name</label>
                    <input type="text"
                        className=' text-gray-900' onChange={(e) => { setName(e.target.value) }} />
                    {(searched.length > 0 && name != "") ? <div className='w-full'>
                        {
                            searched.map(user => {
                                return <div key={user.id} className='w-full mt-2'>
                                    <Link to={"/users/" + user.tag}>
                                        <img src={user.ProfilPictureURI} className=" h-10 w-auto float-left pr-3" alt='Profil Picture' />
                                        <span className='leading-10'>
                                            {user.name + '  @' + user.tag}
                                        </span>
                                    </Link>
                                    <button onClick={() => { unBlock(user.id) }}
                                        className="ml-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                                        UnBlock
                                    </button>
                                </div>
                            })
                        }
                    </div>
                        : <div className='leading-10'>&nbsp;
                        </div>}
                </div>
                {
                    blocked.map((user) => {
                        return <div key={user.userID} className='flex'>
                            <div className='w-10/12'>
                                <Member member={user.userID} userID={loggedInID} doNotSort={true} />
                            </div>
                            <div className='w-2/12'>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                    onClick={() => { unBlock(user.id) }}>
                                    Unblock
                                </button>
                            </div>
                        </div>
                    })
                }
            </div> : <div className="w-full text-center" style={{ fontSize: "x-large" }}>
                There is no Blocked user
            </div>}
        </div>
    )
}

export default BlockedList