import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAlert } from "react-alert"

function Relation({ data, userID, removeRelation }) {
  const loggedInID = useSelector((state) => state.user.id)
  const [friend, setFriend] = useState()
  const [relationData, setRelationData] = useState()
  const [isFriend, setIsFriend] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [isCloseOrFamily, setIsCloseOrFamily] = useState(0)
  const [change, setChange] = useState(false)
  const [needAccept, setNeedAccept] = useState(false)
  const alerts = useAlert()

  const AddRemoveFriend = () => {
    if (isFriend) {
      axios.delete('/api/relations/delete/' + data.id + '/' + data.user1ID + '/' + data.user2ID).then(() => {
        if (data.type < 4 && data.type > 0) alerts.success("Friend Removed")
        else alerts.success("Adding Removed")
        if (data.user1ID == loggedInID || data.user2ID == loggedInID) removeRelation(data)
        setChange(!change)
      })
        .catch((err) => console.log(err))
    } else {
      var friendID = (userID !== data.user2ID) ? data.user2ID : data.user1ID
      axios.post('/api/relations/new', {
        user1ID: loggedInID,
        user2ID: friendID,
        who: loggedInID,
        type: 0
      }).then(res => {
        setIsFriend(true)
        setIsAdded(true)
        alerts.success(res.data.message)
        setChange(!change)
      }).catch((err) => console.log(err))
    }
  }
  useEffect(() => {
    var friendID = (userID !== data.user2ID) ? data.user2ID : data.user1ID
    axios.get('/api/usersNeeded/' + friendID).then((response) => {
      var name = response.data.firstName + " "
      if (response.data.middleName !== null) name += response.data.middleName + " "
      name += response.data.lastName
      response.data.firstName = name
      setFriend(response.data)
    }).catch(Err => console.log(Err))
  }, [userID])

  useEffect(() => {
    var friendID = (userID !== data.user2ID) ? data.user2ID : data.user1ID
    axios.get('/api/relations/isFriend/' + friendID + "/" + loggedInID).then((response) => {
      if (response.data.length > 0) {
        setIsCloseOrFamily(response.data[0].type)
        setRelationData(response.data[0])
        setIsFriend(true)
        if (response.data[0].type == 0 && response.data[0].who == userID) {
          setIsAdded(true)
        }
        if (response.data[0].type == 0 && response.data[0].who != loggedInID) {
          setNeedAccept(true)
        }
        if (response.data[0].type == 4) {
          setIsBlocked(true)
        }
      } else {
        setIsFriend(false)
      }
    }).catch(Err => console.log(Err))
  }, [userID, change])

  const acceptFriend = () => {
    var friendID = (userID !== data.user2ID) ? data.user2ID : data.user1ID
    axios.put('/api/relations/update/' + data.id, {
      type: 1,
      user1ID: loggedInID,
      user2ID: friendID,
      who: loggedInID
    }).then((res) => {
      setIsAdded(true)
      setNeedAccept(false)
      setIsCloseOrFamily(1)
    }).catch(err => console.log(err))
  }

  const updateFriendStatus = (type) => {
    var friendID = (userID !== data.user2ID) ? data.user2ID : data.user1ID
    axios.put('/api/relations/update/' + data.id, {
      type: type,
      user1ID: loggedInID,
      user2ID: friendID,
      who: loggedInID
    }).then((res) => {
      setIsCloseOrFamily(type)
    }).catch(err => console.log(err))
  }

  return (
    <div className='w-full'>
      {(typeof friend === "object" && !isBlocked) ?
        <div className='w-full'>
          <div className="w-1/2 float-left">
            <Link to={"/users/" + friend.tag}>
              <img src={friend.ProfilePicURI.profilePicURI} className=" h-10 w-auto float-left pr-3" alt='Profil Picture' />
              <span className='leading-10'>{friend.firstName}</span>
            </Link>
          </div>
          {(loggedInID > 0) ?
            <div className='float-right w-1/2'>
              {
                (friend.id !== loggedInID) ?
                  <div>
                    {(isFriend) ?
                      <div>
                        {(isAdded && relationData.who == loggedInID) ?
                          <button onClick={() => AddRemoveFriend()} className="h-10 pl-2">Remove Adding</button> :
                          (
                            (needAccept) ? <button onClick={() => acceptFriend()} className="h-10 pl-2">Accept Friend</button>
                              : <div className='float-left'>
                                {(isCloseOrFamily !== 2 && isCloseOrFamily !== 3) ?
                                  <div className='float-left'>
                                    <button onClick={() => updateFriendStatus(3)} className="h-10 pl-2">Family Member</button>
                                    <button onClick={() => updateFriendStatus(2)} className="h-10 pl-2">Close Friend</button>
                                  </div> : (isCloseOrFamily == 2) ? <div className='float-left'>
                                    <button onClick={() => updateFriendStatus(3)} className="h-10 pl-2">Family Member</button>
                                    <button onClick={() => updateFriendStatus(1)} className="h-10 pl-2">Friend</button>
                                  </div> : (isCloseOrFamily == 3) ? <div className='float-left'>
                                    <button onClick={() => updateFriendStatus(2)} className="h-10 pl-2">Close Friend</button>
                                    <button onClick={() => updateFriendStatus(1)} className="h-10 pl-2">Friend</button>
                                  </div> : null}
                                <button onClick={() => AddRemoveFriend()} className="h-10 pl-2">Remove Friend</button>
                              </div>
                          )
                        }
                      </div> :
                      <button onClick={() => AddRemoveFriend()} className="h-10 pl-2">Add Friend</button>
                    }
                  </div> :
                  <button disabled className="h-10 pl-2">You</button>
              }
            </div>
            : null}
        </div>
        : null}
    </div>
  )
}
export default Relation
