import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import EGPProfNameEdit from '../UseMoreFromMOreComponents/EGPProfNameEdit'

function Groups() {
    const [viewFlow, setViewFlow] = useState(0)
    let { tag } = useParams()
    const loggedInID = useSelector((state) => state.user.id)
    const [groups, setGroups] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("/api/users/idFromTag/" + tag).then((res) => {
            if (res.status === 200) {
                axios.get("/api/groupmember/all/" + res.data).then((response) => {
                    setGroups(response.data)
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
            <h1 className='w-full text-center text-2xl'>{(viewFlow === 0) ? "Your own" : "Where you participate"} Groups</h1>
            <div className='w-full flex items-center justify-center '>
                <button className='p-3' onClick={() => { setViewFlow(0) }}>Your Groups</button>
                <button className='p-3' onClick={() => { setViewFlow(1) }}>Joined Groups</button>
            </div>
            <section className='pt-3 w-full h-full' style={{
                WebkitColumnCount: 2, MozColumnCount: 2, columnCount: 2,
                WebkitColumnWidth: "50%", MozColumnWidth: "50%", columnWidth: "50%"
            }}>
                {
                    groups.map((item) => {
                        if (item.rank === 4 && viewFlow == 0) {
                            return <EGPProfNameEdit key={item.groupID} dataID={item.groupID} isOwn={true} type={"group"} />
                        } else if (viewFlow === 1 && item.rank > 0 && item.rank <= 5&&item.rank!=4) {
                            return <EGPProfNameEdit key={item.groupID} dataID={item.groupID} isOwn={false} type={"group"} />
                        }
                    })
                }
            </section>
        </div>
    )
}

export default Groups
