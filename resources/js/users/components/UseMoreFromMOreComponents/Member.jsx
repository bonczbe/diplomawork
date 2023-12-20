import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAlert } from "react-alert"
import { useSelector } from 'react-redux'

function Member({ member, userID, doNotSort }) {
  const loggedInID = useSelector((state) => state.user.id)
  const [members, setMembers] = useState()
  const [isFriend, setIsFriend] = useState(false)
  const [relationData, setRelationData] = useState()
  const [isBlocked, setIsBlocked] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [needAccept, setNeedAccept] = useState(false)
  const [isCloseOrFamily, setIsCloseOrFamily] = useState(0)
  const [change, setChange] = useState(false)
  const alerts = useAlert()

  useEffect(() => {
    axios.get('/api/usersNeeded/' + member).then((response) => {
      var name = response.data.firstName + " "
      if (response.data.middleName !== null) name += response.data.middleName + " "
      name += response.data.lastName
      response.data.firstName = name
      setMembers(response.data)
    }).catch((err) => {
      console.log(err)
    })
  }, [member])

  useEffect(() => {
    axios.get('/api/relations/isFriend/' + member + "/" + userID).then((response) => {
      if (response.data.length > 0) {
        setIsCloseOrFamily(response.data[0].type)
        setRelationData(response.data[0])
        setIsFriend(true)
        if (response.data[0].type == 0 && response.data[0].who == userID) {
          setIsAdded(true)
        }
        if (response.data[0].type == 0 && response.data[0].who != userID) {
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
    axios.put('/api/relations/update/' + relationData.id, {
      type: 1,
      user1ID: userID,
      user2ID: member,
      who: userID
    }).then((res) => {
      setIsAdded(true)
      setChange(!change)
    }).catch(err => console.log(err))
  }


  const AddRemoveFriend = () => {
    if (isFriend) {
      axios.delete('/api/relations/delete/' + relationData.id).then(() => {
        if (relationData.type < 4 && relationData.type > 0) alerts.success("Friend Removed")
        else alerts.success("Adding Removed")
        setChange(!change)
      })
        .catch((err) => console.log(err))
    } else {
      axios.post('/api/relations/new', {
        user1ID: userID,
        user2ID: member,
        who: userID,
        type: 0
      }).then(res => {
        alerts.success(res.data.message)
        setChange(!change)
      }).catch((err) => console.log(err))
    }
  }

  const setCloseing = (type) => {
    console.log(type)
    axios.put('/api/relations/update/' + relationData.id, {
      type: type,
      user1ID: userID,
      user2ID: member,
      who: userID
    }).then((res) => {
      setIsCloseOrFamily(type)
    }).catch(err => console.log(err))
  }

  return (
    <div className='w-full h-9'>
      {(typeof members === "object" && ((!isBlocked) || (isBlocked && doNotSort))) ?
        <div className='w-full'>
          <div className="w-1/2 float-left">
            <Link to={"/users/" + members.tag} className="float-left">
              <img src={members.ProfilePicURI.profilePicURI} className=" h-10 w-auto float-left pr-3" alt='Profil Picture' />
              <span className='leading-10'>{members.firstName}</span>
            </Link>
          </div>
          {(userID > 0 && !doNotSort) ?
            <div className='float-right w-1/2'>
              {
                (members.id != userID) ?
                  <div>
                    {(isFriend) ?
                      <div>
                        {(isAdded && relationData.who == loggedInID) ?
                          <button onClick={() => AddRemoveFriend()} className="h-10 pl-2">Remove Adding</button> :
                          (
                            (needAccept) ? <button onClick={() => acceptFriend()} className="h-10 pl-2">Accept Friend</button>
                              : <div>
                                {(isCloseOrFamily !== 2 && isCloseOrFamily !== 3) ?
                                  <div className="float-left">
                                    <button onClick={() => setCloseing(3)} className="h-10 pl-2">Family Member</button>
                                    <button onClick={() => setCloseing(2)} className="h-10 pl-2">Close Friend</button>
                                  </div> : (isCloseOrFamily == 2) ? <div className="float-left">
                                    <button onClick={() => setCloseing(3)} className="h-10 pl-2">Family Member</button>
                                    <button onClick={() => setCloseing(1)} className="h-10 pl-2">Friend</button>
                                  </div> : (isCloseOrFamily == 3) ? <div className="float-left">
                                    <button onClick={() => setCloseing(2)} className="h-10 pl-2">Close Friend</button>
                                    <button onClick={() => setCloseing(1)} className="h-10 pl-2">Friend</button>
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

export default Member
