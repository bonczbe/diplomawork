import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useAlert } from 'react-alert'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import UserProfileAndName from '../../UseMoreFromMOreComponents/UserProfileAndName'
import ShieldTwoToneIcon from '@mui/icons-material/ShieldTwoTone';
import RemoveModeratorTwoToneIcon from '@mui/icons-material/RemoveModeratorTwoTone';
import VerifiedUserTwoToneIcon from '@mui/icons-material/VerifiedUserTwoTone';
import FollowTheSignsTwoToneIcon from '@mui/icons-material/FollowTheSignsTwoTone';
import RenderContentList from '../RenderContentList'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../../sass/popup.css'
import { Carousel } from 'react-responsive-carousel'
import GavelIcon from '@mui/icons-material/Gavel';
import CleanHandsIcon from '@mui/icons-material/CleanHands';

function BigSettings({ actual, blockedUser }) {
    const [groupChatMembers, setGroupChatMembers] = useState([])
    const [images, setImages] = useState([])
    const [tag, setTag] = useState("")
    const [newMember, setNewMember] = useState()
    const [isBlockeds, setIsBlockeds] = useState(false)
    const alerts = useAlert();
    const loggedInID = useSelector((state) => state.user.id)
    const [groupProfiles, setGroupProfiles] = useState([])
    const [forChangeProfilePic, setForChangeProfilePic] = useState(0)
    const [newProfile, setNewProfile] = useState([])
    /* The above code is using the `useEffect` hook in a React component to listen for various events
    on a channel. When a new image is received, it is added to the `images` state array using the
    `setImages` function. When an image is removed, it is filtered out of the `images` array. When a
    new group chat member is added, they are added to the `groupChatMembers` state array. When a
    member's role is updated, their role is updated in the `groupChatMembers` array. When a member
    is removed, they are filtered out of */
    useEffect(() => {
        actual.channel.listen('.newImage', (e) => {
            setImages(images => [e.message, ...images])
        }).listen('.removeImage', (e) => {
            setImages(images => images.filter((image) => {
                return image.id != e.message.id
            }))
        }).listen('.newMember', (e) => {
            setGroupChatMembers(groupChatMembers => [e.message, ...groupChatMembers])
        }).listen('.newRole', (e) => {
            setGroupChatMembers(groupChatMembers => groupChatMembers.map((member) => {
                if (member.id == e.message.id) {
                    member.role = e.message.role
                }
                return member
            }))
            setGroupChatMembers(groupChatMembers => [e.message, ...groupChatMembers])
        }).listen('.removeMember', (e) => {
            setGroupChatMembers(groupChatMembers => groupChatMembers.filter((member) => {
                return member.id != e.message.id
            }))
        })
    }, [actual.channel.name, loggedInID])
    /* The above code is using the `useEffect` hook in a React component to make an HTTP GET request to
    an API endpoint using Axios. The endpoint is `/api/profilepics/all/index/groupChat/`
    concatenated with the `actual.groupChatID` value. If the `actual.type` is not equal to "user"
    and the `actual.role` is equal to 3, then the response data is set to the `groupProfiles` state
    variable using the `setGroupProfiles` function. The `useEffect` hook is triggered whenever the
    `actual.channel.name` or `loggedInID` */
    useEffect(() => {
        if (actual.type != "user" && actual.role == 3) {
            axios.get('/api/profilepics/all/index/groupChat/' + actual.groupChatID).then((res) => {
                setGroupProfiles(res.data)
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [actual.channel.name, loggedInID])
    /**
     * The function deletes a member from a group chat.
     */
    const deleteMember = (member) => {
        let helper = groupChatMembers.filter((item) => {
            return item.id != member.id
        })
        setGroupChatMembers(helper)
    }
    /**
     * The function blocks a user by sending a PUT request to the server with the necessary parameters.
     */
    const blockUser = () => {
        axios.put("/api/relations/update/" + actual.id, {
            user1ID: actual.user1ID,
            user2ID: actual.user2ID,
            who: loggedInID,
            type: 4
        }).then((res) => {
            blockedUser(actual)
            alerts.success("User blocked!")
        }).catch((err) => {
            console.log(err)
        })
    }
    /**
     * This function deletes a user's chat and displays a success message using Axios and alerts.
     */
    const userChatDelete = () => {
        axios.delete("/api/message/delete/" + actual.datas.id).then(() => {
            blockedUser(actual)
            alerts.success("Chat deleted successfully")
        }).catch(err => {
            console.log(err)
        })
    }
    /**
     * The function deletes a group chat and blocks the user associated with it.
     */
    const groupChatDelete = () => {

        axios.delete("/api/groupchat/delete/" + actual.groupChatID).then(() => {
            blockedUser(actual)
            alerts.success("Chat deleted successfully")
        }).catch(err => {
            console.log(err)
        })

    }
    /**
     * The function allows a user to leave a chat, but prevents the owner from leaving.
     */
    const leaveChat = () => {
        if (actual.role == 3) {
            alerts.info("Owner can't leave the chat, if it sinks the owner will sink with that like Titanic!")
        } else {
            axios.delete("/api/groupchathelper/delete/" + actual.id).then(() => {
                blockedUser(actual)
                alerts.success("You left the channel")
            }).catch(err => {
                console.log(err)
            })
        }
    }
    /**
     * This function updates the role of a member in a group chat based on whether they are an admin or
     * not.
     */
    const addorRemovedmin = (isAdmin, member) => {
        axios.put("/api/groupchathelper/update/" + member.id, {
            role: (isAdmin) ? 1 : 2
        }).then((res) => {
            let helper = [...groupChatMembers]
            helper.map((member) => {
                if (member.id == res.data.id) {
                    member.role = res.data.role
                }
            })
            setGroupChatMembers(helper)
            alerts.success("Role updated!")
        }).catch(err => {
            console.log(err)
        })
    }
    /**
     * This function deletes a member from a group chat and displays a success message using Axios and
     * alerts.
     */
    const GETOUT = (member) => {
        axios.delete("/api/groupchathelper/delete/" + member.id).then(() => {
            deleteMember(member)
            alerts.success("User removed from chat!")
        }).catch(err => {
            console.log(err)
        })
    }
    const BLCK = (member) => {
        axios.put("/api/groupchathelper/update/" + member.id,{
            role:5
        }).then(async() => {
            let helper = await[...groupChatMembers]
            helper = await helper.map((members)=>{
                if(members.id==member.id){
                    return {
                        ...member,
                        role:4
                    }
                }else{
                    return members
                }
            })
            setGroupChatMembers(helper)
            alerts.success("User blocked from chat!")
        }).catch(err => {
            console.log(err)
        })
    }
    const unBLCK = (member) => {
        axios.put("/api/groupchathelper/update/" + member.id,{
            role:1
        }).then(async() => {
            let helper = await[...groupChatMembers]
            helper = await helper.map((members)=>{
                if(members.id==member.id){
                    return {
                        ...member,
                        role:1
                    }
                }else{
                    return members
                }
            })
            setGroupChatMembers(helper)
            alerts.success("User ublocked from chat!")
        }).catch(err => {
            console.log(err)
        })
    }
    /**
     * This function adds a new user to a group chat and assigns them a role.
     */
    const addUser = (e) => {
        e.preventDefault();
        axios.post('/api/groupchathelper/new', {
            userID: newMember.id,
            groupChatID: actual.groupChatID,
            role: 1
        }).then((res) => {
            alerts.success("User Added!")
            setGroupChatMembers([...groupChatMembers, res.data])
            setNewMember(undefined)
        }).catch((err) => {
            console.log(err)
        })
    }
    /* The above code is using the useEffect hook in a React component to fetch data from two different
    API endpoints using axios. The first API call is made only if the current user is not a regular
    user and has a role between 2 and 3. It fetches data related to the group chat settings. The
    second API call fetches data related to all the members of the group chat. The useEffect hook is
    triggered whenever the name of the current channel changes. The fetched data is then stored in
    state variables using the useState hook. */
    useEffect(() => {
        axios.get('/api/groupchathelper/all/groupChat/' + actual.groupChatID).then((res) => {
            setGroupChatMembers(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }, [actual.channel.name])

    const newPicture=()=>{
        
        let fd = new FormData()
        fd.append('outsideID', actual.groupChatID)
        fd.append('image', newProfile)
        fd.append('place', "groupChat")
        axios.post('/api/profilepics/new', fd).then(() => {
            alerts.success("Profil Picture added!")
        }).catch(error => {
            alerts.error("Something went wrong!")
            console.log(error)
        })
    }

    /* The above code is using the `useEffect` hook in a React component to make an HTTP GET request to
    an API endpoint using the Axios library. The endpoint being accessed depends on the value of
    `actual.type`, which is either "user" or "group". The response data is then stored in the
    component's state using the `setImages` function. The `useEffect` hook is triggered whenever the
    value of `actual.channel.name` changes. */
    useEffect(() => {
        axios.get('/api/' + ((actual.type == "user") ? 'messagedata/' : 'groupchatmessage/') + 'all/images/' + ((actual.type == "user") ? actual.datas.id : actual.datas.groupChatID)).then((res) => {
            setImages(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }, [actual.channel.name])

    /* The above code is a React useEffect hook that is triggered whenever the value of the "tag"
    variable changes. It sets a timeout of 500ms and then makes an axios GET request to the server
    to get the user ID associated with the tag. If the request is successful, it then makes another
    axios GET request to get the user data associated with the user ID. It then checks if the user
    is already a member of the group chat by comparing the user ID with the list of group chat
    members. If the user is already a member, it displays an info alert message. If the user is */
    useEffect(() => {
        if (tag !== "") {
            const timeOutId = setTimeout(() => {
                axios.get('/api/users/idFromTag/' + tag).then((res) => {
                    if (res.status === 200) {
                        axios.get('/api/usersNeeded/' + res.data).then((respone) => {
                            let isAdminOrOwner = groupChatMembers.filter((member) => {
                                return respone.data.id == member.userID
                            })
                            if (isAdminOrOwner.length > 0) {
                                alerts.info("User is in the chat!")
                                setNewMember(undefined)
                            } else {
                                setNewMember(respone.data)
                            }
                        })
                    }
                }).catch((err) => {
                    setNewMember(undefined)
                })
            }, 500);
            return () => clearTimeout(timeOutId);
        } else {
            setNewMember(undefined)
        }
    }, [tag])
   /* The above code is defining a function called `renderView` that returns a JSX element. The JSX
   element returned depends on the value of the `isBlockeds` variable. If `isBlockeds` is true, the
   function returns a div with the title "Blockeds" and a list of user profiles for members with a
   role of 5. If `isBlockeds` is false, the function returns a div with the title "Members" and a
   list of user profiles for members with a role other than 5. The function also includes
   conditional rendering for buttons based on the user's */
    const renderView = () => {
        if (isBlockeds) {
            return <div className='w-full' key={isBlockeds}>
                <h2>Blockeds</h2>
                {
                    groupChatMembers.map((member) => {
                        return (member.role == 4) ? (


                            <div key={member.id} className="w-full">
                                <div className={((actual.role > 1 && actual.role < 4) ? "w-2/3 " : 'w-full ') + 'float-left relative'}>
                                <UserProfileAndName userId={member.userID} key={member.userID} />
                                </div>
                                {
                                    ((actual.role > 1 && actual.role < 4)) ? (
                                        <div className='w-1/3 float-left'>
                                            {((actual.role == 3 || actual.role == 2) && member.role == 4) ? <button onClick={() => { GETOUT(member) }} title="Get out!"><FollowTheSignsTwoToneIcon alt={"Get out!"} /></button> : null}
                                            {((actual.role == 3 || actual.role == 2) && member.role == 4) ? <button onClick={() => { unBLCK(member) }} title="unBlock!"><CleanHandsIcon alt={"unBlock!"} /></button> : null}
                                        </div>) : null
                                }
                            </div>
                        ) : null
                    })
                }

            </div>
        } else {
            return <div className='w-full' key={isBlockeds}>
                <h2>Members</h2>
                {
                    groupChatMembers.map((member) => {
                        return (member.role != 4) ? (
                            <div key={member.id} className="w-full">
                                <div className={((actual.role > 1 && actual.role < 4) ? "w-2/3 " : 'w-full ') + 'float-left relative'}>
                                    {(member.role > 1 && member.role < 4) ? <ShieldTwoToneIcon className="absolute z-[69] rounded-full bg-white" style={{ height: "1rem", width: "1rem" }} /> : null}
                                    <UserProfileAndName userId={member.userID} key={member.userID} />
                                </div>
                                {
                                    ((actual.role > 1 && actual.role < 4)) ? (
                                        <div className='w-1/3 float-left'>
                                            {(actual.role == 3 && member.role == 2) ? <button onClick={() => { addorRemovedmin(true, member) }} title="Remove Admin"><RemoveModeratorTwoToneIcon alt={"Remove Admin"} /></button> : null}
                                            {(actual.role == 3 && member.role == 1) ? <button onClick={() => { addorRemovedmin(false, member) }} title="Add as Admin"><VerifiedUserTwoToneIcon alt={"Add as Admin"} /></button> : null}
                                            {(((actual.role == 3 || actual.role == 2) && member.role == 1) || (actual.role == 3 && member.role == 2)) ? <button onClick={() => { GETOUT(member) }} title="Get out!"><FollowTheSignsTwoToneIcon alt={"Get out!"} /></button> : null}
                                            {(((actual.role == 3 || actual.role == 2) && member.role == 1) || (actual.role == 3 && member.role == 2)) ? <button onClick={() => { BLCK(member) }} title="Block!"><GavelIcon alt={"Block!"} /></button> : null}
                                        </div>) : null
                                }
                            </div>
                        ) : null
                    })
                }
            </div>
        }
    }

    /**
     * The function returns the index of a profile item in an array based on its ID.
     * @returns The function `defaultProfItem` returns the index of the `groupProfiles` array where the
     * `id` property matches the value of the `forChangeProfilePic` variable. If no match is found, it
     * returns 0.
     */
    const defaultProfItem = () => {
        let res = 0
        for (let i = 0; i < groupProfiles.length; i++) {
            if (forChangeProfilePic === groupProfiles[i].id) {
                res = i
            }
        }
        return res
    }
    /**
     * This function sets the state for changing the profile picture based on the index of a group
     * profile.
     */
    const handlechangeProf = (index) => {
        setForChangeProfilePic(groupProfiles[index].id)
    }

    /**
     * This function updates the profile picture ID of a group chat using an axios PUT request.
     */
    const changeProfileSetter = (e) => {
        e.preventDefault()
        axios.put('/api/groupchat/editProfileID/' + actual.groupChatID, {
            actualProfilePicID: forChangeProfilePic
        }).then(() => {
            setForChangeProfilePic(forChangeProfilePic)
            alerts.success('Profil Picture setted')
        }).catch((err) => {
            alerts.error(err)
        })
    }
    /**
     * The function deletes a profile picture for a group chat using axios and updates the state
     * accordingly.
     */
    const deletePicture = () => {
        axios.delete('/api/profilepics/delete/' + settedProf + '/groupchat/' + actual.groupChatID).then(() => {
            alerts.success("Profile Picture removed")
            setGroupProfiles(groupProfiles.filter((image) => { image.id != settedProf }))
            defaultProfItem()
            setForChangeProfilePic(1)
        }).catch((err) => {
            alerts.error(err)
        })
    }
    return (
        <div className='w-full h-full'>
            {(actual.type == "user") ? (
                <div className='w-full h-full flex flex-col items-center'>
                    <button onClick={() => { blockUser() }} className="bg-blue-500 w-fit hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                        Block <span>{actual.name}</span>
                    </button>
                    <button onClick={() => { userChatDelete() }} className="bg-blue-500 w-fit hover:bg-blue-700 text-white font-bold py-1 my-2 px-2 rounded">
                        Delete the chat
                    </button>
                    <div className='w-full text-center'>
                        Content
                        <RenderContentList contentList={images} actual={actual} />
                    </div>
                </div>
            ) : (
                <div className='w-full h-full flex flex-col'>
                    {
                        (actual.role == 3) ? (
                            <Popup
                                trigger={<div className='w-full text-center'><button className="button"> Change Profile Picture </button></div>}
                                modal
                            >
                                {close => (
                                    <div className="modal">
                                        <button className="close" onClick={close}>
                                            &times;
                                        </button>
                                        <div className="header">
                                            Change Profile Picture
                                        </div>
                                        <div className="content text-center">
                                            <form onSubmit={changeProfileSetter} className='item w-full pr-5'>
                                                <Carousel autoPlay={false} swipeable onChange={handlechangeProf} selectedItem={defaultProfItem()}>
                                                    {groupProfiles.map((file) => {
                                                        return <div key={file.id}>
                                                            <img src={file.profilePicURI} className='max-h-64 object-contain' />
                                                        </div>
                                                    })}
                                                </Carousel>
                                                <button type="submit">Change</button>
                                            </form>
                                            <form onSubmit={newPicture} className='item w-full pr-5'>
                                                <label htmlFor='newProfilePicture'>
                                                    Upload New Picture
                                                </label>
                                                <br/>
                                                <input
                                                    type="file"
                                                    id="newProfilePicture"
                                                    accept="image/*"
                                                    onChange={(e) => setNewProfile(e.target.files[0])}
                                                />
                                                <br/>
                                                <button type="submit">Upload</button>
                                            </form>
                                            <button onClick={deletePicture}>
                                                Delete ProfilePicture
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Popup>
                        ) : null
                    }
                    <div style={{ maxHeight: "15vh" }}>
                        {
                            (actual.role > 1 && actual.role < 4) ? (
                                <div className='w-full' >
                                    <h2>Add user</h2>
                                    <label>User tag:</label>
                                    <input type="text"
                                        className=' text-gray-900' placeholder='tag' value={tag} onChange={(e) => { setTag(e.target.value) }} />
                                    {
                                        (newMember != undefined) ? <Link to={"/users/" + newMember.tag} className="f-full">
                                            <img src={newMember.ProfilePicURI.profilePicURI} className=" h-10 w-auto float-left pr-3" alt='Profil Picture' />
                                            <span className='leading-10 truncate'>
                                                {newMember.firstName + " "}{(newMember.middleName != "null") ? <span>{newMember.middleName}{" "}</span> : ""}{newMember.lastName}
                                            </span>
                                        </Link> : null
                                    }
                                    <div className='w-full'>
                                        {(newMember != undefined) ? <button onClick={addUser} className="bg-blue-500 w-fit hover:bg-blue-700 text-white font-bold py-1 my-2 px-2 rounded">Add</button> : null}
                                    </div>
                                </div>
                            ) : null
                        }
                    </div>
                    <div className='w-full' style={{ maxHeight: "5vh" }}>
                        <button onClick={() => { setIsBlockeds(!isBlockeds) }} className="bg-blue-500 w-fit hover:bg-blue-700 text-white font-bold py-1 my-2 px-2 rounded">{(isBlockeds) ? "Members" : "Blocked users"}</button>
                    </div>
                    <div style={{ maxHeight: "5vh" }}>
                        {
                            actual.role == 3 ?
                                <button onClick={() => { groupChatDelete() }} className="bg-blue-500 w-fit hover:bg-blue-700 text-white font-bold py-1 my-2 px-2 rounded">
                                    Delete the chat
                                </button> : <button onClick={() => { leaveChat() }} className="bg-blue-500 w-fit hover:bg-blue-700 text-white font-bold py-1 my-2 px-2 rounded">
                                    Leave Chat
                                </button>
                        }
                    </div>
                    <div className='w-full overflow-auto' style={{ maxHeight: "35vh" }}>
                        {renderView()}
                    </div>
                    <div className='w-full overflow-auto' style={{ maxHeight: "40vh" }}>
                        <h2>
                            Content
                        </h2>
                        <RenderContentList contentList={images} actual={actual} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default BigSettings
