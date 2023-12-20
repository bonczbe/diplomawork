import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../sass/popup.css'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"
import KeyboardArrowLeftTwoToneIcon from '@mui/icons-material/KeyboardArrowLeftTwoTone';
import KeyboardArrowRightTwoToneIcon from '@mui/icons-material/KeyboardArrowRightTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import { useAlert } from "react-alert"
import ReportButton from '../UseMoreFromMOreComponents/ReportButton'

function Histories({ fromCalled, uploadedHistory, userID }) {
    const alerts = useAlert()
    const loggedInID = useSelector((state) => state.user.id)
    const [historiesData, setHistoriesData] = useState()
    const [open, setOpen] = useState(false);
    const [actualList, setActualList] = useState([]);
    const [wannaSave, setWannaSave] = useState(false)
    const [wannaNew, setWannaNew] = useState(false)
    const [actualIndex, setActualIndex] = useState(0)
    const [userCollection, setUserCollection] = useState([])
    const [selectedCollectionID, setSelectedCollectionID] = useState(0)
    const [NewCollection, setNewCollection] = useState({
        name: "",
        owner: loggedInID,
        profilePic: []
    })
    const [reportedByUser, setReportedByUser] = useState(false)

    const setterReportedByUser = (fromcalled) => {
        setReportedByUser(fromcalled)
    }
    useEffect(() => {
        if (fromCalled == "main") {
            const getHistoriesData = () => {
                axios.get('/api/history/all/friends/' + loggedInID).then((res) => {
                    let helper = res.data
                    helper.friends = Object.values(helper.friends)
                    helper.friends = helper.friends.sort((a, b) => {
                        let aa = Date.parse(a.histories[0].posted)
                        let bb = Date.parse(b.histories[0].posted)
                        return (bb - aa)
                    })
                    setHistoriesData(helper);
                }).catch((err) => {
                    console.log(err)
                })
            }

            getHistoriesData();

            return () => {
                setHistoriesData([]);
            }
        } else if (fromCalled == "UserPanel") {
            let userUpdaterID = userID
            const getHistoriesData = () => {
                axios.get('/api/history/all/user/' + userUpdaterID).then((res) => {
                    let helper = res.data
                    helper.groups = Object.values(helper.groups)
                    helper.groups = helper.groups.sort((a, b) => {
                        let aa = Date.parse(a.histories[0].posted)
                        let bb = Date.parse(b.histories[0].posted)
                        return (bb - aa)
                    })
                    setHistoriesData(helper);
                }).catch((err) => {
                    console.log(err)
                })
            }

            getHistoriesData();

            return () => {
                setHistoriesData([]);
            }

        }
    }, [loggedInID, fromCalled, userID])
    useEffect(() => {
        if (fromCalled == "main") {
            axios.get('/api/savedhistorygroup/all/thumb/' + loggedInID).then((res) => {
                setUserCollection(res.data)
            }).catch((err) => {
                console.log(err)
            })
        } else if (fromCalled == "UserPanel") {
            let userUpdaterID = userID
            axios.get('/api/savedhistorygroup/all/thumb/' + userUpdaterID).then((res) => {
                setUserCollection(res.data)
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [loggedInID, fromCalled, userID])

    useEffect(async () => {
        if (typeof uploadedHistory.id != "undefined") {
            let historiesUpdate = await { ...historiesData }
            historiesUpdate.owner.histories = await [
                ...historiesUpdate.owner.histories,
                uploadedHistory
            ]
            setHistoriesData(historiesUpdate)
        }
    }, [uploadedHistory.id])

    const closeModal = () => {
        setOpen(false)
        setActualList([])
        setWannaSave(false)
        setWannaNew(false)
    };

    const ShowImages = (imagesList) => {
        setOpen(true)
        setActualList(imagesList)
        return
    }


    const fromMain = () => {
        return <div className='w-full h-full float-left '>
            {
                (historiesData.owner.histories.length > 0) ? <div className='float-left mx-3 h-28 w-16'><button onClick={() => { ShowImages(historiesData.owner) }} className='float-left mx-3 border-2 border-neutral-800 h-20 w-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 justify-center items-center flex'>
                    <img src={historiesData.owner.owner.ProfilePic.profilePicURI} className="w-12 h-16 object-contain bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-neutral-800 rounded-lg" />
                </button>
                    <section className='w-16 truncate mx-3'>
                        {historiesData.owner.owner.name}
                    </section>
                </div> : null
            }
            {
                (typeof historiesData.friends != "undefined" && historiesData.friends != null) ? historiesData.friends.map((member) => {
                    return (member.histories.length > 0) ? <div key={member.owner.id} className='float-left mx-3 h-28 w-16'><button onClick={() => { ShowImages(member) }} key={member.owner.id} className=' float-left mx-3 border-2 border-neutral-800 h-20 w-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 justify-center items-center flex'>
                        <img src={member.owner.ProfilePic.profilePicURI} className="w-12 h-16 object-contain bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-neutral-800 rounded-lg" />
                    </button>
                        <section className='w-16 truncate mx-3'>
                            {member.owner.name}
                        </section>
                    </div> : null
                }) : null
            }
        </div>
    }
    const fromUser = () => {
        return (historiesData.owner != undefined) ? (<div className='w-full h-full float-left '>
            {
                (historiesData.owner.histories.length > 0) ? <div className='float-left mx-3 h-28 w-16'><button onClick={() => { ShowImages(historiesData.owner) }} className=' border-2 border-neutral-800 h-20 w-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 justify-center items-center flex'>
                    <img src={historiesData.owner.owner.ProfilePic.profilePicURI} className="w-12 h-16 object-contain bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-neutral-800 rounded-lg" />
                </button>
                    <section className='w-16 truncate mx-3'>
                        {historiesData.owner.owner.name}
                    </section>
                </div> : null
            }
            {
                (typeof historiesData.groups != "undefined" && historiesData.groups != null) ? historiesData.groups.map((member) => {
                    return (member.histories.length > 0) ? <div key={member.data.id} className='float-left mx-3 h-28 w-16'><button onClick={() => { ShowImages(member) }} className=' float-left mx-3 border-2 border-neutral-800 h-20 w-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 justify-center items-center flex'>
                        <img src={member.data.ProfilePic.profilePicURI} className="w-12 h-16 object-contain bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-neutral-800 rounded-lg" />
                    </button>
                        <section className='w-16 truncate mx-3'>
                            {member.data.name}
                        </section>
                    </div> : null
                }) : null
            }
        </div>) : null
    }
    const nextMember = (toRight) => {
        if (toRight) {
            if (actualList.owner.id == loggedInID) {
                if (historiesData.friends.length > 0) {
                    setActualList(historiesData.friends[0])
                } else {
                    setOpen(false)
                }
            } else {
                if (historiesData.friends.length > 0) {
                    let indexInFriends = -1;
                    for (let i = 0; i < historiesData.friends.length; i++) {
                        if (historiesData.friends[i].owner.id == actualList.owner.id) {
                            indexInFriends = i
                            break;
                        }
                    }
                    if (indexInFriends == historiesData.friends.length - 1) {
                        setOpen(false)
                    } else {
                        setActualList(historiesData.friends[indexInFriends + 1])
                    }
                } else {
                    setOpen(false)
                }
            }
            setWannaSave(false)
            setWannaNew(false)
        } else {
            if (actualList.owner.id == loggedInID) {
                setOpen(false)
            } else {
                if (historiesData.friends.length > 0) {
                    let indexInFriends = -1;
                    for (let i = 0; i < historiesData.friends.length; i++) {
                        if (historiesData.friends[i].owner.id == actualList.owner.id) {
                            indexInFriends = i
                            break;
                        }
                    }
                    if (indexInFriends == 0) {
                        if (historiesData.owner.histories.length == 0) {
                            setOpen(false)
                        } else {
                            setActualList(historiesData.owner)
                        }
                    } else {
                        setActualList(historiesData.friends[indexInFriends - 1])
                    }
                } else {
                    setOpen(false)
                }
            }
        }
        setActualIndex(0)
    }
    const nextSavedOrRecents = (toRight) => {
        if (toRight) {
            if (typeof actualList.owner != "undefined") {
                if (historiesData.groups.length > 0) {
                    setActualList(historiesData.groups[0])
                } else {
                    setOpen(false)
                }
            } else {
                if (historiesData.groups.length > 0) {
                    let indexInGroups = -1;
                    for (let i = 0; i < historiesData.groups.length; i++) {
                        if (historiesData.groups[i].data.id == actualList.data.id) {
                            indexInGroups = i
                            break;
                        }
                    }
                    if (indexInGroups == historiesData.groups.length - 1) {
                        setOpen(false)
                    } else {
                        setActualList(historiesData.groups[indexInGroups + 1])
                    }
                } else {
                    setOpen(false)
                }
            }
            setWannaSave(false)
            setWannaNew(false)
        } else {
            if (typeof actualList.owner == "undefined") {
                console.log(historiesData)
                if (historiesData.groups.length > 0) {
                    let indexInGroups = -1;
                    for (let i = 0; i < historiesData.groups.length; i++) {
                        if (historiesData.groups[i].data.id == actualList.data.id) {
                            indexInGroups = i
                            break;
                        }
                    }
                    if (indexInGroups == 0) {
                        if (historiesData.owner.histories.length == 0) {
                            setOpen(false)
                        } else {
                            setActualList(historiesData.owner)
                        }
                    } else {
                        setActualList(historiesData.groups[indexInGroups - 1])
                    }
                } else {
                    setOpen(false)
                }
            } else {
                setOpen(false)
            }
        }
    }
    const setMovieKey = (e) => {
        setActualIndex(e)
    }

    const isFile = input => 'File' in window && input instanceof File;
    const onSubmit = async (e) => {
        e.preventDefault()
        let groupID = 0
        let newGroup = {}
        if (isFile(NewCollection.profilePic)) {
            await axios.post('/api/savedhistorygroup/new', {
                owner: loggedInID,
                name: NewCollection.name
            }).then(async (res) => {
                let fd = new FormData()
                fd.append('outsideID', res.data.id)
                fd.append('place', "historygroup")
                fd.append('image', NewCollection.profilePic)
                await axios.post('/api/profilepics/new', fd, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }).then((response) => {
                    alerts.success("History created")
                    groupID = res.data.id
                    if (fromCalled == "UserPanel") {
                        newGroup.data = {
                            ProfilePic: {
                                profilePicURI: response.data.profilePicURI
                            },
                            actualProfilePicID: response.data.id,
                            id: res.data.id,
                            name: res.data.name,
                            owner: res.data.owner
                        }
                    }
                }).catch(error => {
                    alerts.error(error.message)
                    console.log(error.message)
                })

            }).catch((err) => {
                console.log(err)
            })
        } else {
            if (NewCollection.profilePic.length == 0) {
                groupID = selectedCollectionID
            }
        }
        if (groupID != 0) {
            axios.post('/api/savedhistorygrouphelper/new', {
                GroupID: groupID,
                historyID: actualList.histories[actualIndex].id
            }).then(() => {
                alerts.success("Saved")
                if (typeof newGroup.data == "undefined" && fromCalled == "UserPanel") {
                    let helper = { ...historiesData }
                    let exist = { isExist: false, place: -1 }
                    for (let i = 0; (i < helper.groups.length && exist.isExist == false); i++) {
                        if (helper.groups[i].data.id == groupID) {
                            exist.isExist = true
                            exist.place = i
                        }
                    }
                    if (exist.isExist) {
                        helper.groups[exist.place].histories = [
                            actualList.histories[actualIndex],
                            ...helper.groups[exist.place].histories
                        ]
                        setHistoriesData(helper)
                    } else {
                        axios.get('/api/history/group/' + groupID).then((res) => {
                            if (res.data.length > 0) {
                                console.log(helper)
                                helper.groups = [
                                    res.data[0],
                                    ...helper.groups
                                ]
                                setHistoriesData(helper)
                            }
                        }).catch((err) => {
                            console.log(err)
                        })
                    }
                } else if (fromCalled == "UserPanel") {
                    newGroup.histories = {
                        ...actualList.histories[actualIndex]
                    }
                    let helper = {
                        groups: [
                            newGroup,
                            ...historiesData.groups
                        ],
                        owner: {
                            ...historiesData.owner
                        }
                    }
                    setHistoriesData(helper)
                }

                setWannaSave(false)
                setWannaNew(false)

            }).catch((err) => {
                alerts.error("Something went wrong")
                console.log(err)
            })
        }
    }
    const deletHistory = () => {
        let deletedID = actualList.histories[actualIndex].id
        let helper = actualList
        axios.delete('/api/history/delete/' + deletedID).then(() => {
            helper.histories = helper.histories.filter((history) => {
                return (history.id != deletedID)
            })
            let historiesUpdate = { ...historiesData }
            if (helper.owner.id == loggedInID) {
                historiesUpdate.owner.histories = helper.histories
            } else {
                historiesData.friends.map((friend) => {
                    if (friend.owner.id == helper.owner.id) {
                        friend.histories = helper.histories
                    }
                })
            }

            setHistoriesData(historiesUpdate)
            setActualList(helper)
            if (helper.histories.length == 0) {
                setOpen(false)
            }
            alerts.success("History deleted")
        }).catch((err) => {
            console.log(err)
        })
    }
    const RemoveFromCollection = () => {
        let groupID = actualList.data.id
        let historyID = actualList.histories[actualIndex].id
        let helper = actualList
        axios.delete('/api/savedhistorygrouphelper/delete/' + historyID + "/" + groupID).then(() => {
            helper.histories = helper.histories.filter((history) => {
                return (history.id != historyID)
            })
            let historiesUpdate = { ...historiesData }
            historiesData.groups.map((friend) => {
                if (friend.data.id == helper.data.id) {
                    friend.histories = helper.histories
                }
            })
            setHistoriesData(historiesUpdate)
            setActualList(helper)
            if (helper.histories.length == 0) {
                setOpen(false)
            }
            alerts.success("History deleted from Collection")
        }).catch((err) => {
            console.log(err)
        })
    }
    const deleteCollection = () => {
        let groupID = actualList.data.id
        let helper = { ...historiesData }
        axios.delete('/api/savedhistorygroup/delete/' + groupID).then(() => {
            let groups = helper.groups.filter((group) => {
                return group.data.id != groupID
            })
            helper.groups = groups
            setHistoriesData(helper)
            setOpen(false)
            alerts.success("Collection deleted")
        }).catch((err) => {
            console.log(err)
        })
        let afterRemoved = userCollection.filter((item) => {
            return item.id != groupID
        })
        setUserCollection(afterRemoved)
    }

    return (typeof historiesData == "object") ? (
        <div className='w-full h-28'>
            {
                (typeof actualList.owner != "undefined" || typeof actualList.data != "undefined") ? <Popup
                    open={open} closeOnDocumentClick onClose={closeModal}
                    modal
                >
                    {close => (
                        <div className="modal">
                            <button className="close" onClick={close}>
                                &times;
                            </button>
                            <div className="content text-center relative">
                                {(fromCalled == "main" || (fromCalled == "UserPanel"
                                )) ? <div className='w-full'>
                                    {
                                        ((typeof actualList.owner != "undefined") ? (actualList.owner.id == loggedInID) : (false)) ? (
                                            <div className='relative'>
                                                {
                                                    (typeof actualList.data == "undefined") ? <button className='text-center mr-2' onClick={() => setWannaSave(!wannaSave)}>
                                                        Save to collection
                                                    </button> : <div>
                                                        <button onClick={() => { RemoveFromCollection() }}>Remove from Collection</button>
                                                        <button onClick={() => { deleteCollection() }}>Remove Collection</button>
                                                    </div>
                                                }
                                                <button className='text-center ml-2' onClick={() => { deletHistory() }}>
                                                    Delete History
                                                    <DeleteForeverTwoToneIcon />
                                                </button>
                                            </div>
                                        ) : null
                                    }
                                    {(wannaSave) ? <div className='relative w-full z-[101] '>
                                        <form className='absolute bg-green-900 w-full rounded-xl border-2 border-transparent border-r-slate-400' onSubmit={(e) => onSubmit(e)}>
                                            <h3>Choose prefered collections, or create a new one</h3>
                                            <button onClick={() => { setWannaNew(!wannaNew) }}>Create new collection</button>
                                            {
                                                (wannaNew) ? (
                                                    <div className="w-full">
                                                        <label>Name</label>
                                                        <br />
                                                        <input type="text"
                                                            value={NewCollection.name} onChange={(e) => setNewCollection({
                                                                ...NewCollection,
                                                                name: e.target.value
                                                            })} required maxLength={32} />
                                                        <br />
                                                        <label>Profile of New Collection</label>
                                                        <br />
                                                        <input
                                                            required
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => setNewCollection({
                                                                ...NewCollection,
                                                                profilePic: e.target.files[0]
                                                            })
                                                            }
                                                            className="block truncate float-left w-3/4 text-gray-900"
                                                        />
                                                        <button className='w-1/4' onClick={(e) => {
                                                            setNewCollection({
                                                                ...NewCollection,
                                                                profilePic: []
                                                            })
                                                        }}>
                                                            <DeleteForeverTwoToneIcon />
                                                        </button>
                                                    </div>
                                                ) : null
                                            }
                                            <div className='w-full h-28'>
                                                {(userCollection.length > 0) ? (
                                                    <div className='overflow-x-scroll mx-3 flex flex-row h-28'>
                                                        {
                                                            userCollection.map((collection) => {
                                                                return <div className='w-20 h-28' key={collection.id}>
                                                                    <button onClick={() => { setSelectedCollectionID(collection.id) }} className={(((selectedCollectionID == collection.id) && NewCollection.profilePic.length == 0) ? " bg-gradient-to-r from-purple-700 to-pink-700 " : " bg-gradient-to-r from-purple-500 to-pink-500 ") + "mx-3 border-2 border-neutral-800 h-20 w-16 rounded-xl justify-center items-center flex"}>
                                                                        <img src={collection.profilePicURI} className="w-12 h-16 object-contain bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-neutral-800 rounded-lg " />
                                                                    </button>
                                                                    <section className='w-full truncate text-center px-3'>
                                                                        {collection.name}
                                                                    </section>
                                                                </div>
                                                            })
                                                        }
                                                    </div>
                                                ) : "You don't have any collection"}
                                            </div>
                                            <button type="submit">Submit</button>
                                        </form>
                                    </div> : null}
                                </div> : null}
                                <div>
                                    <button className='float-left h-full' onClick={() => { (fromCalled == "main") ? nextMember(false) : nextSavedOrRecents(false) }}>
                                        <KeyboardArrowLeftTwoToneIcon />
                                    </button>
                                    <Carousel
                                        onChange={setMovieKey}
                                        interval={3000}
                                        autoPlay={wannaSave == false} showArrows={true} className="inline-block w-4/5" emulateTouch={true}
                                        showStatus={false} useKeyboardArrows={true}
                                        onSwipeEnd={() => { (fromCalled == "main") ? nextMember(true) : nextSavedOrRecents(true) }}
                                        showThumbs={false}
                                    >
                                        {
                                            actualList.histories.map((file) => {
                                                return <div key={file.id}>
                                                    <ReportButton fromWhere={"history"} setterReportedByUser={setterReportedByUser} outsideID={file.id} />
                                                    {
                                                        (file.URI.endsWith(".mp4") || file.URI.endsWith(".ogv") || file.URI.endsWith(".ogg")) ?
                                                            ((reportedByUser == false) ? <video style={{ pointerEvents: "all" }} controls>
                                                                <source src={file.URI} style={{ pointerEvents: "all" }} />
                                                                Your browser does not support the video tag.
                                                            </video> : <img src={"/images/sensitive.jpg"} alt="Profile Picture" />) :
                                                            ((reportedByUser == false) ? <img style={{ pointerEvents: "all" }} alt="Post image" src={file.URI} />
                                                                : <img src={"/images/sensitive.jpg"} alt="Profile Picture" />)
                                                    }
                                                </div>
                                            })}
                                    </Carousel>
                                    <button className='float-right h-full'>
                                        <KeyboardArrowRightTwoToneIcon onClick={() => { (fromCalled == "main") ? nextMember(true) : nextSavedOrRecents(true) }} />
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}
                </Popup> : null
            }
            {
                (fromCalled == "main") ? fromMain() : ((fromCalled == "UserPanel") ? fromUser() : null)
            }
        </div>
    ) : null
}

export default Histories
