import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import EGPProfNameEdit from '../UseMoreFromMOreComponents/EGPProfNameEdit'

function Events() {
    const [viewFlow, setViewFlow] = useState(0)
    let { tag } = useParams()
    const loggedInID = useSelector((state) => state.user.id)
    const [events, setEvents] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("/api/users/idFromTag/" + tag).then((res) => {
            if (res.status === 200) {
                axios.get("/api/eventshelper/all/user/" + res.data).then((response) => {
                    setEvents(response.data)
                })
            } else {
                navigate('/404')
            }
        }).catch((err) => {
            console.log(err)
        })

    }, [tag, loggedInID])

    return (
        <div className='w-full h-full'>
            <h1 className='w-full text-center text-2xl'>{(viewFlow === 0) ? "Your own" : "Where you participate"} Events</h1>
            <div className='w-full flex items-center justify-center '>
                <button className='p-3' onClick={() => { setViewFlow(0) }}>Your Events</button>
                <button className='p-3' onClick={() => { setViewFlow(1) }}>Joined Events</button>
            </div>
            <section className='pt-3 w-full h-full' style={{
                WebkitColumnCount: 2, MozColumnCount: 2, columnCount: 2,
                WebkitColumnWidth: "50%", MozColumnWidth: "50%", columnWidth: "50%"
            }}>
                {
                    events.map((item) => {
                        if (item.role === 0 && viewFlow == 0) {
                            return <EGPProfNameEdit key={item.eventID} dataID={item.eventID} isOwn={true} type={"event"} />
                        } else if (viewFlow === 1 && item.role > 0 && item.role < 5) {
                            return <EGPProfNameEdit key={item.eventID} dataID={item.eventID} isOwn={false} type={"event"} />
                        }
                    })
                }
            </section>
        </div>
    )
}

export default Events
