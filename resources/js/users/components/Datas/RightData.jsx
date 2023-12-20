import axios from 'axios'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { WebsocketPresenceChannel } from "../../Service/WebsocketHelper"
import ThingProfName from '../UseMoreFromMOreComponents/ThingProfName'
import GroupAddTwoToneIcon from '@mui/icons-material/GroupAddTwoTone';
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../sass/popup.css'
import { useAlert } from 'react-alert'

function RightData({ settingChats, setterActual }) {
    var loggedInID = useSelector((state) => state.user.id)
    var loggedInEmail = useSelector((state) => state.user.email)
    const [search, setSearch] = useState("")
    const [serachType, setSerachType] = useState("Any")
    const [offlineGroups, setOfflineGroups] = useState([])
    const [onlineGroups, setOnlineGroups] = useState([])
    const [offlineFriend, setOfflineFriends] = useState([])
    const [onlineFriend, setOnlineFriends] = useState([])
    const [loadingGroups, setLoadingGroups] = useState(true)
    const [loadingFriends, setLoadingFriends] = useState(true)
    const [name, setName] = useState("");
    const [profileFile, setProfileFile] = useState([]);
    const alerts = useAlert()
/* The above code is adding an event listener to the window object for the "beforeunload" event. When
the user navigates away from the page or closes the window, the event is triggered. The code then
prevents the default behavior of the event (which is to close the window) and sends a POST request
to the server at the specified endpoint ("/api/users/logout") using the axios library. The POST
request includes the ID and email of the currently logged in user. This code is likely used to log
out the user when they leave the page or close the window to ensure their session is properly ended */

    window.addEventListener("beforeunload", (ev) => {
        ev.preventDefault();
        axios.post('/api/users/logout', {
            id: loggedInID,
            email: loggedInEmail
        })
    });
    /* The above code is a React useEffect hook that fetches data from two different API endpoints and
    sets the state of online and offline friends and groups based on the presence of users in their
    respective channels. It uses the axios library to make HTTP requests and the
    WebsocketPresenceChannel function to create channels for real-time communication. The code
    filters the response data to only include friends and groups with a certain type and role,
    respectively. It then maps over the filtered data to add a channel and channel ID property to
    each friend and group object. The code then listens for events on each channel, such as when a */
    useEffect(() => {
        if (loggedInID > 0) {
            axios.get('/api/relations/all/fromUser/' + loggedInID).then(async (response) => {
                let filteredResponse = await response.data.filter((friend) => {
                    return (typeof friend.type == "undefined" || (friend.type > 0 && friend.type < 4))
                })
                await filteredResponse.map((relation) => {
                    const channelID = relation.user1ID + "" + relation.user2ID
                    const channel = WebsocketPresenceChannel("PrivateChats." + channelID)
                    relation.channel = channel
                    relation.channelID = channelID
                    relation.type="user"
                })
                let offlineHelper = filteredResponse
                let onlineHelper = []
                await filteredResponse.map((relation) => {
                    relation.channel.listen('blocked', e => {
                    }).here(async (users) => {
                        if (users.length > 0) {
                            let helper = users.filter((user) => { return (user.id != loggedInID) })
                            if (helper.length > 0) {
                                let inserter = {
                                    ...helper[0],
                                    user1ID: relation.user1ID,
                                    user2ID: relation.user2ID,
                                    channelID: relation.channelID,
                                    channel: relation.channel,
                                    othercount: helper.length
                                }
                                onlineHelper = [...onlineHelper, inserter]
                                offlineHelper = offlineHelper.filter((user) => { return (user.user1ID != helper[0].id) })
                                offlineHelper = offlineHelper.filter((user) => { return (user.user2ID != helper[0].id) })
                                let helping = []
                                await onlineHelper.map((user) => {
                                    if (!helping.includes(user)) {
                                        helping.push(user)
                                    }
                                })
                                onlineHelper = helping
                                setOnlineFriends(onlineHelper)
                            }
                        }
                        let helping = []
                        await offlineHelper.map((user) => {
                            if (!helping.includes(user)) {
                                helping.push(user)
                            }
                        })
                        offlineHelper = helping
                        setOfflineFriends(offlineHelper)
                    }).joining((user) => {
                        if (user.id != loggedInID) {
                            let exist = onlineHelper.filter((member) => { return (user.id == member.id) })
                            if (exist.length > 0) {
                                onlineHelper.map(member => {
                                    if (member.id == exist[0].id) {
                                        member.othercount += 1
                                    }
                                })
                            } else {
                                user.channelID = relation.channelID
                                user.channel = relation.channel
                                user.user1ID = relation.user1ID,
                                    user.user2ID = relation.user2ID,
                                    user.othercount = 1
                                onlineHelper = [...onlineHelper, user]
                            }
                            offlineHelper = offlineHelper.filter((users) => { return (users.user1ID != user.id) })
                            offlineHelper = offlineHelper.filter((users) => { return (users.user2ID != user.id) })
                            setOnlineFriends(onlineHelper)
                            setOfflineFriends(offlineHelper)
                        }
                    }).leaving((user) => {
                        if (user.id != loggedInID) {
                            let exist = onlineHelper.filter((member) => { return (user.id == member.id) })
                            if (exist.length > 0) {
                                if (exist[0].othercount == 1) {
                                    onlineHelper = onlineHelper.filter(users => user.id != users.id)
                                    let help = {
                                        user1ID: user.id,
                                        user2ID: loggedInID,
                                        name: user.name,
                                        type: user.type,
                                        channelID: relation.channelID,
                                        channel: relation.channel
                                    }
                                    offlineHelper = [...offlineHelper, help]
                                } else {
                                    onlineHelper.map((member) => {
                                        if (member.id == exist[0].id) {
                                            member.othercount -= 1
                                        }
                                    })
                                }
                                setOfflineFriends(offlineHelper)
                                setOnlineFriends(onlineHelper)
                            }
                        }
                    })
                })
                setLoadingFriends(false)
            }).catch((error) => {
                console.log(error)
            })

            axios.get('/api/groupchathelper/all/user/' + loggedInID).then((res) => {
                let filteredGroups = res.data.filter((group) => {
                    return (group.role > 0 && group.role < 5)
                })
                filteredGroups.map((group) => {
                    const channelID = group.groupChatID
                    const channel = WebsocketPresenceChannel("GroupChats." + channelID)
                    group.channel = channel
                    group.channelID = channelID
                    group.type="groupChat"
                })
                let offlineHelper = [...filteredGroups]
                let onlineHelper = []
                filteredGroups.map((group) => {
                    group.channel.listen('blocked', e => {
                        //meg kéne írni
                    }).here(async (users) => {
                        let isOnlineGroup = {
                            id: users[0].groupID,
                            name: users[0].name,
                            type: users[0].type,
                            amount: users.length,
                            channelID: group.channelID,
                            channel: group.channel
                        }
                        if (isOnlineGroup.amount > 1) onlineHelper = [...onlineHelper, isOnlineGroup]
                        offlineHelper = offlineHelper.filter((help) => { return (help.groupChatID != isOnlineGroup.id || isOnlineGroup.amount < 2) })
                        let helping = []
                        await onlineHelper.map((user) => {
                            if (!helping.includes(user)) {
                                helping.push(user)
                            }
                        })
                        onlineHelper = helping
                        setOnlineGroups(onlineHelper)
                        helping = []
                        await offlineHelper.map((user) => {
                            if (!helping.includes(user)) {
                                helping.push(user)
                            }
                        })
                        offlineHelper = helping
                        setOfflineGroups(offlineHelper)
                    }).joining(async (user) => {
                        let exist = await onlineHelper.filter((group) => { return (user.groupID == group.id) })
                        if (exist.length > 0) {
                            let updater = [...onlineHelper]
                            await updater.map((groups) => {
                                if (groups.id == user.groupID) { groups.amount += 1 }
                            })
                            setOnlineGroups(updater)
                            offlineHelper = offlineHelper.filter((member) => {
                                return user.groupID != member.groupChatID
                            })
                            setOfflineGroups(offlineHelper)
                        } else {
                            let isOnlineGroup = {
                                id: user.groupID,
                                name: user.name,
                                type: user.type,
                                amount: 2,
                                channelID: group.channelID,
                                channel: group.channel
                            }
                            onlineHelper = [...onlineHelper, isOnlineGroup]
                            offlineHelper = offlineHelper.filter((member) => {
                                return user.groupID != member.groupChatID
                            })
                            await setOnlineGroups(onlineHelper)
                            await setOfflineGroups(offlineHelper)
                        }
                    }).leaving((user) => {
                        let exist = onlineHelper.filter((group) => { return (user.groupID == group.id) })
                        if (exist.length > 0) {
                            let amount = exist[0].amount - 1
                            let isOnlineGroup = {
                                id: user.groupID,
                                groupChatID: user.groupID,
                                name: user.name,
                                type: user.type,
                                amount: amount,
                                channelID: group.channelID,
                                channel: group.channel
                            }
                            onlineHelper.map((group) => {
                                if (group.id == user.groupID) group.amount = amount
                            })
                            if (isOnlineGroup.amount < 2) {
                                offlineHelper = [...offlineHelper, isOnlineGroup]
                                setOfflineGroups([...offlineHelper])
                            }
                            setOnlineGroups(onlineHelper)
                        }
                    })
                })
                setLoadingGroups(false)
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [loggedInID])



   /* The above code is using the `useEffect` hook in a React component to set the `settingChats` state
   variable with an array of friends and groups. It checks if the `loadingFriends` and
   `loadingGroups` variables are both false before creating a new array `helper` by spreading the
   `onlineFriend`, `offlineFriend`, `onlineGroups`, and `offlineGroups` arrays. Finally, it sets the
   `settingChats` state variable with the `helper` array. The `useEffect` hook is triggered whenever
   any of the `offlineFriend`, `onlineFriend`, ` */
    useEffect(() => {
        if (loadingFriends == false && loadingGroups == false) {
            let helper = [
                ...onlineFriend,
                ...offlineFriend,
                ...onlineGroups,
                ...offlineGroups
            ]
            settingChats(helper)
        }
    }, [offlineFriend, onlineFriend, onlineGroups, offlineGroups])

    /* The above code is defining a function called `renderItems` that returns a JSX element based on
    the value of a variable called `searchType`. The JSX element returned will display a list of
    online and offline friends or groups based on the search type. The `ThingProfName` component is
    used to display each friend or group. */
    const renderItems = () => {
        switch (serachType) {
            case "Member":
                return <div className='w-full' key={"member"}>
                    {
                        onlineFriend.map((member) => {
                            return <ThingProfName key={member.type + "" + member.id + "online"} member={member} setterActual={setterActual} isOnline={true}/>
                        })
                    }
                    <hr />
                    {
                        offlineFriend.map((friend) => {
                            let member = {
                                ...friend,
                                type: "user"
                            }
                            return <ThingProfName key={member.type + "" + member.id + "offline"} member={member} setterActual={setterActual} isOnline={false}/>
                        })}
                </div>
            case "Groupchat":
                return <div className='w-full' key={"Groupchat"}>
                    {
                        onlineGroups.map((member) => {
                            return (member.amount > 1) ? <ThingProfName key={member.type + "" + member.id + "online"} member={member} setterActual={setterActual} isOnline={true}/> : null
                        })
                    }
                    <hr />
                    {
                        offlineGroups.map((group) => {
                            let member = {
                                ...group,
                                type: group.type,
                                id: group.id,
                                groupChatID: group.groupChatID
                            }
                            return <ThingProfName key={member.type + "" + member.id + "offline"} member={member} setterActual={setterActual}  isOnline={false}/>
                        })
                    }
                </div>
            default:
                let offlineMixer = [
                    ...offlineFriend,
                    ...offlineGroups
                ]
                let mixer = [
                    ...onlineFriend,
                    ...onlineGroups
                ]
                return <div className='w-full' key={"Any"}>
                    {
                        mixer.map((thing) => {
                            let member = {
                                ...thing,
                                type: (thing.type == "user" || thing.type == "groupChat") ? thing.type : "user"
                            }
                            return (member.type == "user" || member.amount > 1) ? <ThingProfName key={((typeof member.user1ID != "undefined" || member.type == "user") ? "user" : "groupChat") + "" + member.id + "online"} member={member} setterActual={setterActual} /> : null
                        })
                    }
                    <hr />
                    {
                        offlineMixer.map((thing) => {
                            let member = {
                                ...thing,
                                type: (thing.type == "user" || thing.type == "groupChat") ? thing.type : "user"
                            }
                            return <ThingProfName key={((typeof member.user1ID != "undefined" || member.type == "user") ? "user" : "groupChat") + "" + member.id + "offline"} member={member} setterActual={setterActual} />
                        })
                    }
                </div>
        }
    }
    /**
     * This function searches for members or group chats based on the search type and search query.
     * @returns The function `searching` is returning an array of React components (`<ThingProfName>`
     * components) that match the search criteria based on the `searchType` parameter. The components
     * are generated based on the `found` array, which is filtered based on the search term and the
     * type of member (user or group) depending on the search type.
     */
    const searching = () => {
        switch (serachType) {
            case "Any":
                let offlines = [
                    ...offlineFriend
                ]
                offlines.map((member) => {
                    member.type = "user"
                })
                let found = [
                    ...onlineFriend,
                    ...offlines,
                    ...onlineGroups,
                    ...offlineGroups
                ]
                found = found.filter((member) => member.name.toLowerCase().includes(search.toLowerCase()))
                found = found.filter((member) => {
                    if (member.type == "user") {
                        return true
                    } else if (typeof member.userID == "undefined") {
                        return (member.amount > 1)
                    }
                    return true;
                })
                return found.map((member) => {
                    return <ThingProfName key={member.type + "" + member.id + "foundGroup"} member={member} setterActual={setterActual}  isOnline={undefined}/>
                })
            case "Member":
                offlines = [
                    ...offlineFriend
                ]
                offlines.map((member) => {
                    member.type = "user"
                })
                found = [
                    ...onlineFriend,
                    ...offlines
                ]
                found = found.filter((member) => member.name.toLowerCase().includes(search.toLowerCase()))
                return found.map((member) => {
                    return <ThingProfName key={member.type + "" + member.id + "foundMember"} member={member} setterActual={setterActual}  isOnline={undefined}/>
                })
            case "Groupchat":
                found = [
                    ...onlineGroups,
                    ...offlineGroups
                ]
                found = found.filter((member) => member.name.toLowerCase().includes(search.toLowerCase()))
                found = found.filter((member) => {
                    if (typeof member.userID == "undefined") {
                        return (member.amount > 1)
                    }
                    return true;
                })
                return found.map((member) => {
                    return <ThingProfName key={member.type + "" + member.id + "foundGroup"} member={member} setterActual={setterActual}  isOnline={undefined}/>
                })
            default:
                console.log("Are u jesus? This can't be happening... Save me daddy!")
                break;
        }
    }
    /**
     * The function creates a new group chat and adds it to the list of online groups.
     */
    const createGroupChat = (e) => {
        e.preventDefault();
        let helper = name.replace(' ', '')
        if (loggedInID > 0 && helper.length > 0) {
            axios.post('/api/groupchat/new', {
                name: helper,
                userID: loggedInID
            }).then((res) => {
                let fd = new FormData()
                fd.append('outsideID', res.data.id)
                fd.append('image', profileFile)
                fd.append('place', "groupChat")
                axios.post('/api/profilepics/new', fd).then((response) => {
                    const channel = WebsocketPresenceChannel("PrivateChats." + res.data.id)
                    let newGroup = {
                        ...res.data,
                        channel: channel,
                        channelID: res.data.id,
                        ProfilePicURI: {
                            ProfilePicURI: response.data.profilePicURI
                        },
                        type: "groupChat"
                    }
                    setOnlineGroups([
                        ...onlineGroups,
                        newGroup
                    ])
                    alerts.success("Groupchat created!")
                }).catch(error => {
                    alerts.error("Something went wrong!")
                    console.log(error)
                })
            }).catch((err) => {
                console.log(err)
            })
        }
    }
    return (
        <div className='item w-2/12 h-full sticky top-0 bg-left-rigth-color border-l border-left-rigth-text-color'>
            {(loggedInID > 0) ?
                <div className="flex flex-col w-full h-full text-center">
                    <div className='w-full h-fit  bg-left-rigth-color'>
                        <input
                            className='mt-3 text-gray-900'
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className='w-full text-gray-900 mt-1'>
                            Type:
                            <select onChange={(e) => setSerachType(e.target.value)} value={serachType} className="ml-2">
                                <option value="Any">Any</option>
                                <option value="Member">Member</option>
                                <option value="Groupchat">Groupchat</option>
                            </select>
                        </div>
                        <Popup
                            trigger={<div className='w-full text-center'><button className="button"><GroupAddTwoToneIcon /></button></div>}
                            modal
                        >
                            {close => (
                                <div className="modal">
                                    <button className="close" onClick={close}>
                                        &times;
                                    </button>
                                    <div className="header"> Create new GroupChat </div>
                                    <div className="content text-center">
                                        <form onSubmit={createGroupChat}>
                                            <section className='w-full'>
                                                <label>Name: </label>
                                                <input type="text" className=' text-gray-900' value={name} required maxLength={32} onChange={(e) => setName(e.target.value)} />
                                            </section>
                                            <section className='w-full'>
                                                <label>Profile Picture: </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className=' text-gray-900'
                                                    onChange={(e) => setProfileFile(e.target.files[0])}
                                                    required
                                                />
                                            </section>
                                            <button type="submit" className='w-fit'>Create</button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </Popup>
                    </div>
                    <div className='flex-1 max-h-full text-left overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-300' style={{ WebkitOverflowScrolling: 'touch' }}>
                        {(search == "") ? renderItems() : searching()}
                    </div>
                </div> : null}
        </div>
    )
}

export default RightData
