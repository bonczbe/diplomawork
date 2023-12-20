import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Update from './Update'
import Admins from '../Admins'
import EditPictures from '../EditPictures'
import BlockedList from '../BlockedList'

function EditPageMenu() {
  let { name, pageID } = useParams()
  const loggedInID = useSelector((state) => state.user.id)
  const [editType, setEditType] = useState()
  const [view, setView] = useState(0)
  const owner = 3, adr = 2;
  const navigate = useNavigate();

 /**
  * The function `renderViewFlow` returns a React component based on the value of the `param`
  * parameter.
  * @returns The function `renderViewFlow` returns a React component based on the value of the `param`
  * parameter passed to it. The returned component depends on the value of `param` and can be one of
  * the following: `<EditPictures />`, `<Admins />`, `<BlockedList />`, or `<Update />`.
  */
  const renderViewFlow = (param) => {
    switch (param) {
      case 1:
        return <EditPictures spaceID={pageID} editType={editType} place={'page'} />;
      case 2:
        return (editType == owner) ? <Admins spaceID={pageID} editType={editType} place={'page'} ranks={{ admin: adr, owner: owner }} /> : null;
      case 3:
        return <BlockedList spaceID={pageID} editType={editType} place={'page'} />;
      default:
        return <Update pageID={pageID} editType={editType} ranks={{ admin: adr, owner: owner }} />;
    }
  }
/* The `useEffect` hook is used to execute a side effect after rendering. In this case, it checks if
the `loggedInID` is less than 1 and if so, it navigates to a different page using the `navigate`
function from the `react-router-dom` library. The dependency array `[loggedInID]` ensures that the
effect is only executed when the `loggedInID` value changes. */

  useEffect(() => {
    if (loggedInID < 1) navigate('/events/' + name + '/' + eventId)
  }, [loggedInID])
/* The `useEffect` hook is making an HTTP GET request to the server to retrieve the relationship
between the logged-in user and the page specified by `pageID`. If the relationship is less than 2 or
greater than 3, it navigates to the unauthorized page using the `navigate` function from the
`react-router-dom` library. If the request fails, it logs the error to the console and navigates to
the page specified by `name` and `pageID`. The dependency array `[loggedInID, name, pageID]` ensures
that the effect is only executed when one of these values changes. Finally, it sets the `editType`
state to the value returned by the server. */

  useEffect(() => {
    axios.get('/api/pagehelper/relation/' + pageID + '/' + loggedInID).then((res) => {
      if (res.data < 2 || res.data > 3) {
        navigate('/unauthorized')
      }
      setEditType(res.data)
    }).catch((err) => {
      console.log(err)
      navigate('/pages/' + name + '/' + pageID)
    })
  }, [loggedInID, name, pageID])
  return (editType) ? (
    <div className="w-full h-full pt-3">
      <div className='flex justify-between w-full my-4'>
        <button onClick={() => { setView(0) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Datas</button>
        {(editType == owner) ? <button onClick={() => { setView(2) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Admins</button> : null}
        {(editType == owner) ? <button onClick={() => { setView(1) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">ProfilePicture and WallPaper</button> : null}
        <button onClick={() => { setView(3) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Blocked Users</button>
      </div>
      {renderViewFlow(view)}
    </div>
  ) : null
}

export default EditPageMenu
