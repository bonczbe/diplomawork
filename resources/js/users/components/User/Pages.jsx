import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import EGPProfNameEdit from '../UseMoreFromMOreComponents/EGPProfNameEdit'

function Pages() {
    const [viewFlow, setViewFlow] = useState(0)
    let { tag } = useParams()
    const loggedInID = useSelector((state) => state.user.id)
    const [pages, setPages] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("/api/users/idFromTag/" + tag).then((res) => {
            if (res.status === 200) {
                axios.get("/api/pagehelper/all/" + res.data).then((response) => {
                    setPages(response.data)
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
            <h1 className='w-full text-center text-2xl'>{(viewFlow === 0) ? "Your own" : "Where you participate"} Pages</h1>
            <div className='w-full flex items-center justify-center '>
                <button className='p-3' onClick={() => { setViewFlow(0) }}>Your Pages</button>
                <button className='p-3' onClick={() => { setViewFlow(1) }}>Joined Pages</button>
            </div>
            <section className='pt-3 w-full h-full' style={{
                WebkitColumnCount: 2, MozColumnCount: 2, columnCount: 2,
                WebkitColumnWidth: "50%", MozColumnWidth: "50%", columnWidth: "50%"
            }}>
                {
                    pages.map((item) => {
                        if (item.rank === 3 && viewFlow == 0) {
                            return <EGPProfNameEdit key={item.pageID} dataID={item.pageID} isOwn={true} type={"page"} />
                        } else if (viewFlow === 1 && item.rank > 0 && item.rank <= 3) {
                            return <EGPProfNameEdit key={item.pageID} dataID={item.pageID} isOwn={false} type={"page"} />
                        }
                    })
                }
            </section>
        </div>
    )
}

export default Pages
