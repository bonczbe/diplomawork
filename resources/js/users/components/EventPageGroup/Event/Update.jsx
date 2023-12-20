import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAlert } from "react-alert"
import axios from 'axios'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../../sass/popup.css'
import { useNavigate } from 'react-router-dom'

export function Update({ eventId, editType, ranks }) {
    const editTyp = editType - 2
    const alerts = useAlert()
    const navigate = useNavigate();
    var loggedInID = useSelector((state) => state.user.id)
    const [name, setName] = useState()
    const [desc, setDesc] = useState()
    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()
    const [pageURL, setPageURL] = useState()
    const [place, setPlace] = useState()
    const [loading, setLoading] = useState(true)
    /* The `useEffect` hook is used to perform side effects in a functional component. In this case, it
    is fetching data from an API endpoint using Axios when the component mounts or when the
    dependencies (`loggedInID`, `eventId`, and `editType`) change. The `if` statement inside the
    `useEffect` hook checks if the `editType` is within a certain range, if `loading` is true, and
    if `loggedInID` is greater than 0 before making the API call. If any of these conditions are not
    met, the user is redirected to a different page using the `navigate` function from the
    `react-router-dom` library. Once the API call is successful, the state variables `name`, `desc`,
    `startDate`, `endDate`, and `pageURL` are updated using the `setName`, `setDesc`,
    `setStartDate`, `setEndDate`, and `setPageURL` functions respectively, and `loading` is set to
    false. If the API call fails, an error message is logged to the console and the user is
    redirected to a 404 page. */
    useEffect(() => {
        if ((editTyp) > -1 && (editTyp) < 2 && loading && loggedInID > 0) {
            axios.get('/api/event/show/' + eventId).then((res) => {
                setName(res.data.name)
                setDesc(res.data.description)
                setPlace(res.data.place)
                setStartDate(res.data.startDate.replace(' ', 'T').slice(0, 16))
                setEndDate(res.data.endDate.replace(' ', 'T').slice(0, 16))
                setPageURL(res.data.pageURL)
                setLoading(false)
            }).catch((err) => {
                console.log(err)
                navigate('/404')
            })
        } else {
            navigate('/unauthorized')
        }
    }, [loggedInID, eventId, editType])


   /**
    * The function converts a date string in the format of "YYYY-MM-DDTHH:MM:SS" to a numerical value.
    * @returns The function `dateCalculator` returns a number that represents the input date in a
    * specific format.
    */
    const dateCalculator = (array) => {
        let dateinNumber = 0
        let newDateTime = [
            ...array.split('-')
        ]
        newDateTime[2] = newDateTime[2].toString().split('T')
        newDateTime[2][1] = newDateTime[2][1].toString().split(':')
        newDateTime = newDateTime.flat().flat()
        for (let i = newDateTime.length - 1; i >= 0; i--) {
            dateinNumber += parseInt(newDateTime[i]) * Math.pow(100, newDateTime.length - i - 1)
        }
        return dateinNumber
    }
    /**
     * The function updates event data and checks if the start and end dates are valid.
     */
    const updateData = (e) => {
        e.preventDefault()
        var checkerDate = new Date()
        checkerDate.setMinutes(checkerDate.getMinutes() - checkerDate.getTimezoneOffset());
        if (dateCalculator(startDate) <= dateCalculator(endDate)) {
            if (dateCalculator(checkerDate.toISOString().slice(0, 16)) < dateCalculator(endDate)) {
                axios.put('/api/event/update/' + eventId + '/' + loggedInID, {
                    name: name.trim(),
                    description: desc.trim(),
                    startDate: startDate,
                    endDate: endDate,
                    place:place,
                    pageURL: (typeof pageURL === "string" && pageURL.trim() != "") ? pageURL.trim() : null
                }).then(() => {
                    navigate('/events/settings/' + name.trim() + "/" + eventId)
                    alerts.success("Event Updated")
                }).catch((err) => {
                    alerts.error(err)
                })
            } else {
                alerts.error("You can't live in the past, look forward!")
            }
        } else {
            alerts.error("Time can't go backward!")
        }
    }
    return (loggedInID > 0 && !loading && (editTyp) > -1 && (editTyp) < 2) ? (
        <div className='w-full h-full'>
            <form onSubmit={updateData} className="shadow-md w-full h-full rounded px-8 py-8 mb-4 flex flex-col justify-center items-center">
                <h1 className="text-lg md:text-xl lg:text-2xl mb-8 font-bold">
                    Update Event Data
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
                            defaultValue={name} required disabled={editTyp !== ranks.owner} onChange={(e) => { if (editTyp == ranks.owner) setName(e.target.value) }} maxLength="32"
                        />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="Description" className="leading-7 text-gray-900">
                            Description:
                        </label>
                        <textarea
                            rows="3" cols="40" placeholder="Description" autoComplete="off" maxLength="512"
                            defaultValue={(desc != null) ? desc : ""} required onChange={(e) => setDesc(e.target.value)}
                            id="Description"
                            className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                        />
                    </div>
                    <div className='w-full'>
                        <div className='w-full'>
                            <label htmlFor="Start" className="leading-7 text-gray-900">Start of the event:</label>
                            <input
                                required
                                id="Start"
                                type="datetime-local"
                                className=' text-gray-900'
                                defaultValue={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value.slice(0, 16))
                                }}
                            />
                        </div>
                        <div className='w-full'>
                            <label htmlFor="End" className="leading-7 text-gray-900">End of the event:</label>
                            <input
                                required
                                id='End'
                                className=' text-gray-900'
                                type="datetime-local"
                                defaultValue={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value.slice(0, 16))
                                }}
                            />
                        </div>
                        <div>
                            <label htmlFor="eventPlace" className="leading-7 text-gray-900">Place: </label>
                            <input
                                type="text"
                                id='eventPlace'
                                className=' text-gray-900'
                                defaultValue={pageURL}
                                onChange={(e) => {
                                        setPlace(e.target.value)
                                }}
                                maxLength="32"
                            />
                        </div>
                        <div>
                            <label htmlFor="url" className="leading-7 text-gray-900">URL of the event: </label>
                            <input
                                type="text"
                                id='url'
                                className=' text-gray-900'
                                defaultValue={pageURL}
                                onChange={(e) => {
                                        setPageURL(e.target.value)
                                }}
                                maxLength="64"
                            />
                        </div>
                    </div>
                    <button type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Upload
                    </button>
                </div>
            </form>
        </div>
    ) : null
}

export default Update;
