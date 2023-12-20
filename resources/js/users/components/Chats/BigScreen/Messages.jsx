import axios from 'axios'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import BigSettings from './BigSettings'
import MessagesPanel from './MessagesPanel'
import LeftItems from './LeftItems'
import { WebsocketPresenceChannel } from '../../../Service/WebsocketHelper'
import Loading from '../../../../animation/Loading'

function Messages({ actual, setterActual, blockedUser, fromRightData, loadingFromRight }) {
    const [loading, setLoading] = useState(true)
    const [allChat, setAllChat] = useState([])
    const [userEmotes, setUserEmotes] = useState([])
    const loggedInID = useSelector((state) => state.user.id)


    /* `useEffect` is a React hook that allows you to perform side effects in functional components. In
    this case, the `useEffect` hook is being used to fetch data from an API endpoint using Axios
    when the `loggedInID` or `actual` state variables change. */
    useEffect(async () => {
        axios.get('/api/message/all/' + loggedInID).then(async (res) => {
            let filtered = await res.data.filter((member) => (member.datas.messageData != "blocked"))
            filtered = await filtered.map((member) => {
                const channel = (member.type == "user") ? WebsocketPresenceChannel("PrivateChats." + member.channelID) : WebsocketPresenceChannel("GroupChats." + member.channelID)
                member.channel = channel
                return member
            })
            if (filtered.length > 0 && fromRightData == false) {
                if (actual.type == "none") await setterActual(filtered[0])
            }
            await setAllChat(filtered)
            await setLoading(false)
        }).catch((err) => {
            console.log(err)
        })
    }, [loggedInID, actual])

    /* This `useEffect` hook is fetching data from an API endpoint using Axios and setting the state
    variable `userEmotes` with the response data. The hook is triggered whenever the `loggedInID`
    state variable changes. */
    useEffect(() => {
        axios.get('/api/personalemote/all/' + loggedInID).then((res) => {
            setUserEmotes(res.data)
        }).catch(err => {
            console.log(err)
        })
    }, [loggedInID])

    /* This `useEffect` hook is triggered whenever the `actual` state variable changes. If the
    `fromRightData` variable is `true` and the `actual` variable has a defined `type`, it sends a
    GET request to an API endpoint using Axios. The endpoint URL is constructed based on the
    `loggedInID`, `actual` type, and `actual` user IDs or channel ID. The response data is then used
    to update the `actual` state variable using the `setterActual` function. */
    useEffect(() => {
        if (fromRightData == true) {
            if (typeof actual.type != "undefined") {
                axios.get('/api/message/all/right/' + loggedInID + "/" + ((actual.type == "user") ? ((actual.user1ID == loggedInID) ? actual.user2ID : actual.user1ID) : actual.channelID) + "/" + actual.type).then(async (res) => {
                    let actualizer = await {
                        ...actual,
                        user1ID: res.data.user1ID,
                        user2ID: res.data.user2ID,
                        ...res.data
                    }
                    setterActual(actualizer)
                }).catch((err) => {
                    console.log(err)
                })
            }
        }
    }, [actual])

    /**
     * This function re-sorts items in an array of chats based on the input message or group chat ID.
     */
    const reSortLeftItems = async (input) => {
        let found = await allChat.find((chat) => {
            if (typeof input.groupChatID == "undefined" && chat.type == "user") {
                return chat.datas.messageData.messageID == input.messageID
            } else if (typeof input.groupChatID != "undefined" && chat.type == "groupChat") {
                return chat.datas.messageData.groupChatID == input.groupChatID
            }
        })
        let helper = await allChat.filter((item) => {
            if (typeof input.groupChatID == "undefined" && item.type == "user") {
                return item.datas.messageData.messageID != input.messageID
            } else if (typeof input.groupChatID != "undefined" && item.type == "groupChat") {
                return item.datas.messageData.groupChatID != input.groupChatID
            } else {
                return true
            }
        })
        let help = [
            found,
            ...helper
        ]
        setAllChat(help)
    }

    return (loading == true)?(
        <div>
            <h1 className="w-full text-2xl text-center pt-8">Loading...</h1>
            <Loading />
        </div>
    ):( actual.type != "none" && typeof actual.channel != "undefined") ? (
        <div className='w-full h-full' key={actual.channel.name}>
            <div className='w-3/12 float-left h-full border-solid border-2 border-transparent border-r-slate-400 pr-2'>
                {
                    (typeof allChat == "object") ? allChat.map((member) => {
                        return (member.datas.messageData != "empty") ? <LeftItems key={member.type + "" + member.id + "listItem"} actual={actual} member={member} setterActual={setterActual} reSortLeftItems={reSortLeftItems} /> : null
                    }) : null
                }
            </div>
            <div className='w-6/12 float-left h-full border-solid border-2 border-transparent border-r-slate-400'>
                {
                    ((fromRightData == false || loadingFromRight == false) && typeof actual.datas != "undefined") ? (
                        <MessagesPanel actual={actual} key={actual.channel} userEmotes={userEmotes} />
                    ) : null
                }
            </div>
            <div className='w-3/12 float-left h-full pl-2'>
                {
                    ((fromRightData == false || loadingFromRight == false) && typeof actual.datas != "undefined") ? <BigSettings actual={actual} key={actual} blockedUser={blockedUser} /> : null
                }
            </div>
        </div>
    ) : <div className='w-full h-full'>
        &nbsp;
    </div>
}

export default Messages
