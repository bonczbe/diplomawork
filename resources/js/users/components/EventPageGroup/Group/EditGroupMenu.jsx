import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Update from './Update'
import Admins from '../Admins'
import EditPictures from '../EditPictures'
import BlockedList from '../BlockedList'
import Requests from './Requests'

function EditGroupMenu() {
  let { name, groupID } = useParams()
  const loggedInID = useSelector((state) => state.user.id)
  const [editType, setEditType] = useState()
  const [view, setView] = useState(0)
  const owr = 4, adr = 3;
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
        return <EditPictures spaceID={groupID} editType={editType} place={'group'} />;
      case 2:
        return (editType == owr) ? <Admins spaceID={groupID} editType={editType} place={'group'} ranks={{ admin: adr, owner: owr }} /> : null;
        case 3:
          return <BlockedList spaceID={groupID} editType={editType} place={'group'} />;
          case 4:
        return <Requests spaceID={groupID} editType={editType} place={'group'} />;
      default:
        return <Update groupID={groupID} editType={editType} ranks={{ admin: adr, owner: owr }} />;
    }
  }
/* The `useEffect` hook is used to perform side effects in a functional component. In this case, it is
checking if the `loggedInID` is less than 1 and if so, it is navigating the user to a different page
using the `navigate` function from the `react-router-dom` library. The dependency array
`[loggedInID]` ensures that this effect is only triggered when the `loggedInID` value changes. */

useEffect(() => {
    if (loggedInID < 1) navigate('/events/' + name + '/' + eventId)
  }, [loggedInID])
/* The `useEffect` hook is making an HTTP GET request to the server to retrieve the relationship
between the logged-in user and the group specified by `groupID`. If the relationship is not that of
an admin or owner (i.e. the relationship value is less than 3 or greater than 4), the user is
redirected to the unauthorized page using the `navigate` function from the `react-router-dom`
library. If the request fails, the user is redirected to the group page specified by `name` and
`groupID`. The dependency array `[loggedInID, name, groupID]` ensures that this effect is only
triggered when the `loggedInID`, `name`, or `groupID` values change. Once the relationship value is
retrieved, it is stored in the component's state using the `setEditType` function. */

  useEffect(() => {
    axios.get('/api/groupmember/relation/' + groupID + '/' + loggedInID).then((res) => {
      if (res.data < 3 || res.data > 4) {
        navigate('/unauthorized')
      }
      setEditType(res.data)
    }).catch((err) => {
      console.log(err)
      navigate('/groups/' + name + '/' + groupID)
    })
  }, [loggedInID, name, groupID])
  return (editType) ? (
    <div className="w-full h-full pt-3">
      <div className='flex justify-between w-full my-4'>
        <button onClick={() => { setView(0) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Datas</button>
        <button onClick={() => { setView(4) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Requests</button>
        {(editType == owr) ? <button onClick={() => { setView(2) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Admins</button> : null}
        {(editType == owr) ? <button onClick={() => { setView(1) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">ProfilePicture and WallPaper</button> : null}
        <button onClick={() => { setView(3) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Blocked Users</button>
      </div>
      {renderViewFlow(view)}
    </div>
  ) : null
}

export default EditGroupMenu
