import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAlert } from "react-alert"
import axios from 'axios'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../../sass/popup.css'
import { useNavigate } from 'react-router-dom'

export function Update({ groupID, editType, ranks }) {
    const alerts = useAlert()
    const navigate = useNavigate();
    const loggedInID = useSelector((state) => state.user.id)
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState()
    const [desc, setDesc] = useState()
    const [status, setStatus] = useState()

   /* This is a useEffect hook that runs when the component mounts and whenever the dependencies
   (groupID, editType, loggedInID) change. It checks if the editType is between 2 and 5, the loading
   state is true, and the loggedInID is greater than 0. If all conditions are met, it makes an API
   call to get the group data using the groupID, and sets the name, description, and status states
   with the response data. It also sets the loading state to false. If any of the conditions are not
   met, it navigates the user to either the unauthorized or 404 page. */
    useEffect(() => {
        if (editType > 2 && editType < 5 && loading && loggedInID > 0) {
            axios.get('/api/group/show/' + groupID).then((res) => {
                console.log(res.data)
                setName(res.data.name)
                setDesc(res.data.description)
                setStatus(res.data.status)
                setLoading(false)
            }).catch((err) => {
                console.log(err)
                navigate('/404')
            })
        } else {
            navigate('/unauthorized')
        }
    }, [groupID, editType, loggedInID])
    /**
     * The function updates a group's name, description, and status using an axios PUT request and then
     * navigates to the group's settings page while displaying a success message or an error message if
     * there was an issue.
     */
    const updateGroup = (e) => {
        e.preventDefault()
        axios.put('/api/group/update/' + groupID + '/' + loggedInID, {
            name: name.trim(),
            description: desc.trim(),
            status: status,
        }).then(() => {
            navigate('/groups/settings/' + name.trim() + "/" + groupID)
            alerts.success("Group Updated")
        }).catch((err) => {
            alerts.error(err)
        })
    }
    return (loggedInID > 0 && !loading && editType > 2 && editType < 5) ? (
        <div className='w-full h-full'>
            <form onSubmit={updateGroup} className="shadow-md w-full h-full rounded px-8 py-8 mb-4 flex flex-col justify-center items-center">
                <h1 className="text-lg md:text-xl lg:text-2xl mb-8 font-bold">
                    Update Group Data
                </h1>
                <div className="w-full max-w-xs">
                    <div className="relative mb-4">
                        <label htmlFor="Name" className="leading-7 text-gray-900">
                            Name:
                        </label>
                        <input
                            type="text"
                            id="Name"
                            className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            defaultValue={name} required disabled={editType !== ranks.owner} onChange={(e) => { if (editType == ranks.owner) setName(e.target.value) }} maxLength="32"
                        />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="public" className="leading-7 text-gray-900">
                            Is this group public?
                        </label>
                        <input
                            type="checkbox"
                            id="public"
                            className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            defaultChecked={status} onChange={(e) => {
                                if (editType == ranks.owner) setStatus(e.target.checked)
                            }} disabled={editType !== ranks.owner}
                        />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="Description" className="leading-7 text-gray-900">
                        Description:
                        </label>
                        <input
                            type="text"
                            id="Description"
                            maxLength={50}
                            className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            defaultValue={desc} onChange={(e) => { setDesc(e.tartget.value) }}
                        />
                    </div>
                    <button type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Upload
                    </button>
                </div>
            </form>
            {(editType == ranks.owner) ? <div className='w-full'>
                <Popup
                    trigger={<div className='w-full text-center'> <button className="button"> Delete the Group </button></div>}
                    modal>
                    {close => (
                        <div className="modal">
                            <button className="close" onClick={close}>
                                &times;
                            </button>
                            <div className="header">
                                Do you want to delete this group?
                            </div>
                            <div className="content text-center">
                                <section className='bg-white'>
                                    If you hit yes, your Group will be deleted, can not be return this choice!
                                </section>
                                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={() => {
                                    axios.delete('/api/group/delete/' + groupID + "/" + loggedInID).then(() => {
                                        alerts.success("Group deleted!")
                                        navigate('/')
                                    }).catch(() => {
                                        alerts.error("Something went wrong!")
                                    })
                                }}>Yes</button>
                            </div>
                        </div>
                    )}
                </Popup>
            </div> : null}
        </div>
    ) : null
}
export default Update;
