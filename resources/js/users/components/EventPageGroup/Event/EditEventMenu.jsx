import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Update from './Update'
import Admins from '../Admins'
import EditPictures from '../EditPictures'
import BlockedList from '../BlockedList'

function EditEventMenu() {
  let { name, eventId } = useParams()
  var loggedInID = useSelector((state) => state.user.id)
  const [editType, setEditType] = useState()
  const [view, setView] = useState(0)
  const owr = 2, adr = 3;
  const navigate = useNavigate();

  /**
   * The function `renderViewFlow` returns a React component based on the value of the `param`
   * parameter.
   * @returns The function `renderViewFlow` returns a React component based on the value of the `param`
   * parameter passed to it. The returned component depends on the value of `param` and can be one of
   * the following: `<EditPictures>`, `<Admins>`, `<BlockedList>`, or `<Update>`.
   */
  const renderViewFlow = (param) => {
    switch (param) {
      case 1:
        return <EditPictures spaceID={eventId} editType={editType} place={'event'} />;
      case 2:
        return (editType == owr) ? <Admins spaceID={eventId} editType={editType} place={'event'} ranks={{ admin: adr - 2, owner: owr - 2 }} /> : null;
      default:
        return <Update eventId={eventId} editType={editType} ranks={{ admin: adr - 2, owner: owr - 2 }} />;
    }
  }

  /* The `useEffect` hook is checking if the `loggedInID` is less than 1, and if it is, it navigates
  the user to the event page with the given `name` and `eventId`. The `loggedInID` variable is
  passed as a dependency to the `useEffect` hook, which means that the effect will be re-run
  whenever `loggedInID` changes. */
  useEffect(() => {
    if (loggedInID < 1) navigate('/events/' + name + '/' + eventId)
  }, [loggedInID])

  /* The `useEffect` hook is used to fetch data from the server and update the state of the component.
  In this case, it is fetching the relationship between the logged-in user and the event with the
  given `eventId`. The `loggedInID`, `name`, and `eventId` variables are passed as dependencies to
  the `useEffect` hook, which means that the effect will be re-run whenever any of these variables
  change. */
  useEffect(() => {
    axios.get('/api/eventshelper/relation/' + eventId + '/' + loggedInID).then((res) => {
      setEditType(res.data + 2)
      if (res.data < 0 || res.data > 1) {
        navigate('/unauthorized')
      }
    }).catch((err) => {
      console.log(err)
      navigate('/events/' + name + '/' + eventId)
    })
  }, [loggedInID, name, eventId])
  return (editType) ? (
    <div className="w-full h-full pt-3">
      <div className='flex justify-between w-full my-4'>
        <button onClick={() => { setView(0) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Datas</button>
        {(editType == owr) ? <button onClick={() => { setView(2) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Admins</button> : null}
        {(editType == owr) ? <button onClick={() => { setView(1) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">ProfilePicture and WallPaper</button> : null}
      </div>
      {renderViewFlow(view)}
    </div>
  ) : null
}

export default EditEventMenu
