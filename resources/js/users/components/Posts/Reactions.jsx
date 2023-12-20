import React, { useState, useEffect } from 'react'
import { indexByActions, userActiveAction } from "../../Service/ReactionsFetches"
import Reaction from './Reaction'
import axios from 'axios';

function Reactions({ place, data, loggedInId, where }) {
  const [userAction, setUserAction] = useState([])
  const [fetched, setFetched] = useState([])
  const [reaction, setReaction] = useState([
    { "typeOfAction": "Star", "total": 0 },
    { "typeOfAction": "Meh", "total": 0 },
    { "typeOfAction": "Love", "total": 0 },
    { "typeOfAction": "WOW", "total": 0 },
    { "typeOfAction": "Cry", "total": 0 },
    { "typeOfAction": "Laugh", "total": 0 },
    { "typeOfAction": "HeartBroken", "total": 0 }
  ])
  const changeActions = (fetchData, setter) => {
    if (fetchData.length > 0) setter(fetchData)

  }
  useEffect(() => {
    if (fetched.length > 0) {
      var actions = [
        ...reaction
      ]
      for (var i = 0; i < actions.length; i++) {
        for (var j = 0; j < fetched.length; j++) {
          if (actions[i].typeOfAction === fetched[j].typeOfAction) {
            actions[i].total = fetched[j].total
          }
        }
      }
      setReaction(actions)
    }
  }, [fetched]);


  useEffect(() => {
    indexByActions(place, data.id, where, changeActions, setFetched)
    if (loggedInId > 0) {
      userActiveAction(place, loggedInId, data.id, where, changeActions, setUserAction)
    }
  }, [loggedInId]);

  const changeReaction = (newReaction) => {
    if (loggedInId > 0) {
      if (userAction.length > 0) {
        switch (place) {
          case "normalPost":
            axios.put("/api/postaction/update/" + userAction[0].id, { typeOfAction: newReaction }).then(() => {
              setUserAction([{ "id": userAction[0].id, "typeOfAction": newReaction }])
            }).catch((err) => {
              console.log(err.message)
            })
            break;
          case "pagePost":
            axios.put("/api/pagepostreaction/update/" + userAction[0].id, { typeOfAction: newReaction }).then(() => {
              setUserAction([{ "id": userAction[0].id, "typeOfAction": newReaction }])
            }).catch((err) => {
              console.log(err.message)
            })
            break;
          case "groupPost":
            axios.put("/api/grouppostreaction/update/" + userAction[0].id, { typeOfAction: newReaction }).then(() => {
              setUserAction([{ "id": userAction[0].id, "typeOfAction": newReaction }])
            }).catch((err) => {
              console.log(err.message)
            })
            break;
          default:
            break;
        }
      } else {
        var dataToNew = {
          outsideID: data.id,
          typeOfAction: newReaction,
          typeofdata: where,
          userID: loggedInId
        }
        switch (place) {
          case "normalPost":
            axios.post("/api/postaction/new", dataToNew).then((response) => {
              setUserAction([{ "id": response.data.id, "typeOfAction": response.data.typeOfAction }])
            }).catch((err) => {
              console.log(err.message)
            })
            break;
          case "pagePost":
            axios.post("/api/pagepostreaction/new", dataToNew).then((response) => {
              setUserAction([{ "id": response.data.id, "typeOfAction": response.data.typeOfAction }])
            }).catch((err) => {
              console.log(err.message)
            })
            break;
          case "groupPost":
            axios.post("/api/grouppostreaction/new", dataToNew).then((response) => {
              setUserAction([{ "id": response.data.id, "typeOfAction": response.data.typeOfAction }])
            }).catch((err) => {
              console.log(err.message)
            })
            break;
          default:
            break;
        }
      }

      var newListReaction = [...reaction]
      newListReaction.map((item) => {
        if (userAction.length > 0 && item.typeOfAction === userAction[0].typeOfAction) {
          item.total = item.total - 1
        } else if (item.typeOfAction === newReaction) {
          item.total = item.total + 1
        }
      })
      setReaction(newListReaction)
    }
  }

  const removeReaction = (removedReaction) => {
    if (loggedInId > 0) {
      switch (place) {
        case "normalPost":
          axios.delete("/api/postaction/delete/" + userAction[0].id).then((res) => {
            var newListReaction = [...reaction]
            newListReaction.map((item) => {
              if (userAction.length > 0 && item.typeOfAction === userAction[0].typeOfAction && item.typeOfAction === removedReaction) {
                item.total = item.total - 1
              }
            })
            setUserAction([])
            setReaction(newListReaction)
          }).catch((err) => {
            console.log({ "code": err.statusCode, "message": err.message })
          })
          break;
        case "pagePost":
          axios.delete("/api/pagepostreaction/delete/" + userAction[0].id).then((res) => {
            var newListReaction = [...reaction]
            newListReaction.map((item) => {
              if (userAction.length > 0 && item.typeOfAction === userAction[0].typeOfAction && item.typeOfAction === removedReaction) {
                item.total = item.total - 1
              }
            })
            setUserAction([])
            setReaction(newListReaction)
          }).catch((err) => {
            console.log({ "code": err.statusCode, "message": err.message })
          })
          break;
        case "groupPost":
          axios.delete("/api/grouppostreaction/delete/" + userAction[0].id).then((res) => {
            var newListReaction = [...reaction]
            newListReaction.map((item) => {
              if (userAction.length > 0 && item.typeOfAction === userAction[0].typeOfAction && item.typeOfAction === removedReaction) {
                item.total = item.total - 1
              }
            })
            setUserAction([])
            setReaction(newListReaction)
          }).catch((err) => {
            console.log({ "code": err.statusCode, "message": err.message })
          })
          break;
        default:
          break;
      }
    }
  }

  return (
    <div className='w-full my-4 text-center'>
      <div className='w-fit inline-block'>
        {
          reaction.map((item) => {
            return <Reaction key={item.typeOfAction} type={item.typeOfAction} total={item.total} activeType={(userAction.length > 0 && userAction[0].typeOfAction === item.typeOfAction) ? userAction[0].typeOfAction : "none"} changeReaction={changeReaction} removeReaction={removeReaction} loggedInId={loggedInId}></Reaction>
          })
        }
      </div>
    </div>
  )
}

export default Reactions
