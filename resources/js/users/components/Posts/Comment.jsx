import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Reply from './Reply'
import { useAlert } from "react-alert"
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../sass/popup.css'
import Reactions from './Reactions';
import ReportButton from '../UseMoreFromMOreComponents/ReportButton'

function Comment({ data, refreshFunc, place, fromAdmin }) {

    const [repliesShow, setRepliesShow] = useState(false)
    const [replies, setReplies] = useState()
    let loggedInId = 0
    if (fromAdmin != true) {
        loggedInId = useSelector((state) => state.user.id)
    }
    const [removedReply, setRemovedReply] = useState(0)
    const alerts = useAlert()
    const [newReply, setNewReply] = useState("")
    const [isBlocked, setIsBlocked] = useState(false)
    const [editText, setEditText] = useState("")
    const [reportedByUser, setReportedByUser] = useState(false)

    const setterReportedByUser = (fromcalled) => {
        setReportedByUser(fromcalled)
    }

    const deleteComment = () => {
        switch (place) {
            case 'normalPost':
                axios.delete('/api/comments/delete/' + data.id).then(() => {
                    alerts.success("Comment Removed")
                    refreshFunc(data)
                }).catch((error) => {
                    alerts.error("Comment deletion failed")
                    console.log(error);
                });
                break;
            case 'pagePost':
                axios.delete('/api/pagepostcomment/delete/' + data.id).then(() => {
                    alerts.success("Comment Removed")
                    refreshFunc(data)
                }).catch((error) => {
                    alerts.error("Comment deletion failed")
                    console.log(error);
                });
                break;
            case 'groupPost':
                axios.delete('/api/grouppostcomment/delete/' + data.id).then(() => {
                    alerts.success("Comment Removed")
                    refreshFunc(data)
                }).catch((error) => {
                    alerts.error("Comment deletion failed")
                    console.log(error);
                });
                break;
            default:
                break;
        }
    }
    useEffect(() => {
        var text = (place !== "pagePost") ? data.what : data.text
        setEditText(text)
    }, [])

    useEffect(() => {
        if (loggedInId > 0 && data) axios.get('/api/relations/isFriend/' + data.userID + "/" + loggedInId).then((response) => {
            if (response.data.length > 0) {
                response.data.map((datas) => {
                    if (datas.type == 3) {
                        setIsBlocked(true)
                    }
                })
            }
        }).catch(Err => console.log(Err))
    }, [loggedInId]);

    useEffect(() => {
        if (replies) {
            const newReply = replies.filter((comm) => comm.id !== removedReply)
            setReplies(newReply)
        }
    }, [removedReply])

    const refresh = (remdata) => {
        setRemovedReply(remdata.id)
    }
    useEffect(() => {
        switch (place) {
            case 'normalPost':
                if (loggedInId > 0) axios.get('/api/replies/all/comments/' + data.id).then((response) => {
                    if (response.data.length > 0) {
                        setReplies(response.data);
                    }
                }).catch((error) => {
                    console.log(error)
                })
                break;
            case 'pagePost':
                if (loggedInId > 0) axios.get('/api/pagepostreply/all/' + data.id).then((response) => {
                    if (response.data.length > 0) {
                        setReplies(response.data);
                    }
                }).catch((error) => {
                    console.log(error)
                })
                break;
            case 'groupPost':
                if (loggedInId > 0) axios.get('/api/grouppostreply/all/' + data.id).then((response) => {
                    if (response.data.length > 0) {
                        setReplies(response.data);
                    }
                }).catch((error) => {
                    console.log(error)
                })
                break;
            default:
                break;
        }
    }, [isBlocked])

    const addNewReply = (e) => {
        e.preventDefault()
        switch (place) {
            case 'normalPost':
                axios.post('/api/replies/new', {
                    commentID: data.id,
                    userID: loggedInId,
                    what: newReply
                }).then((response) => {
                    var datas;
                    if (replies) {
                        datas = [response.data[0], ...replies]
                    } else {
                        datas = [response.data[0]]
                    }
                    setReplies(datas)
                    setNewReply("")
                    alerts.success("Reply Added")
                }).catch((error) => {
                    alerts.error("Reply adding failed")
                    console.log(error);
                });
                break;
            case 'pagePost':
                axios.post('/api/pagepostreply/new', {
                    commentID: data.id,
                    userID: loggedInId,
                    what: newReply
                }).then((response) => {
                    var datas;
                    if (replies) {
                        datas = [response.data[0], ...replies]
                    } else {
                        datas = [response.data[0]]
                    }
                    setReplies(datas)
                    setNewReply("")
                    alerts.success("Reply Added")
                }).catch((error) => {
                    alerts.error("Reply adding failed")
                    console.log(error);
                });
                break;
            case 'groupPost':
                axios.post('/api/grouppostreply/new', {
                    commentID: data.id,
                    userID: loggedInId,
                    what: newReply
                }).then((response) => {
                    var datas;
                    if (replies) {
                        datas = [response.data[0], ...replies]
                    } else {
                        datas = [response.data[0]]
                    }
                    setReplies(datas)
                    setNewReply("")
                    alerts.success("Reply Added")
                }).catch((error) => {
                    alerts.error("Reply adding failed")
                    console.log(error);
                });
                break;
            default:
                break;
        }
    }
    const commentEditing = (e) => {
        e.preventDefault()
        switch (place) {
            case 'normalPost':
                axios.put('/api/comments/update/' + data.id, {
                    what: editText
                }).then(() => {
                    alerts.success("Comment Updated")
                }).catch(() => {
                    alerts.error("Something went wrong!")
                })
                break;
            case 'pagePost':
                axios.put('/api/pagepostcomment/update/' + data.id, {
                    text: editText
                }).then(() => {
                    alerts.success("Comment Updated")
                }).catch(() => {
                    alerts.error("Something went wrong!")
                })
                break;
            case 'groupPost':
                axios.put('/api/grouppostcomment/update/' + data.id, {
                    what: editText
                }).then(() => {
                    alerts.success("Comment Updated")
                }).catch(() => {
                    alerts.error("Something went wrong!")
                })
                break;
            default:
                break;
        }
    }

    return (reportedByUser == false) ? (
        <div className='w-full'>
            {(!isBlocked) ? <div className='w-full px-8'>
                {(fromAdmin != true) && <hr className='pb-3 ' />}
                <img src={data.ownerImage.profilePicURI} alt="Profile Picture" style={{
                    height: 40, width: 40, borderRadius: 5, float: 'left', marginRight: 10
                }} />
                <span className='w-1/2' style={{
                    lineHeight: "40px", fontFamily: "cursive", fontSize: "large",
                    letterSpacing: "0.2em"
                }}>{data.owner}</span>
                <span className='w-1/2' style={{
                    lineHeight: "40px", fontFamily: "cursive", fontSize: "normal",
                    letterSpacing: "0.2em"
                }}> {data.date.toString().replace('T', ' ').split('.')[0]}</span>
                {(data.userID == loggedInId && fromAdmin != true) ?
                    <div className='float-right'>
                        <Popup
                            trigger={<div className='w-full text-center'><button className="button"> Edit Comment </button></div>}
                            modal
                        >
                            {close => (
                                <div className="modal" >
                                    <button className="close" onClick={close}>
                                        &times;
                                    </button>
                                    <div className="header"> Editing your comment </div>
                                    <div className="content text-center">
                                        <form onSubmit={commentEditing}>
                                            <section className='w-full'>
                                                <textarea rows="15" placeholder="Comment place" autoComplete="off" maxLength="3000" value={editText} style={{ whiteSpace: "pre-wrap" }} onChange={(e) => setEditText(e.target.value)} className="w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                                            </section>
                                            <button type="submit" className='w-fit'>Update your Comment</button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </Popup>
                        <button onClick={() => { deleteComment() }}>Delete Comment</button>
                    </div>
                    : <div>
                        {(fromAdmin != true) && <ReportButton fromWhere={((place == "normalPost") ? ("normalComment") : ((place == "pagePost") ? ("pageComment") : ((place == "groupPost") ? ("groupComment") : ("trash"))))} setterReportedByUser={setterReportedByUser} outsideID={data.id} />}
                    </div>}
                <div className='w-full px-10 py-4'>
                    <section className="w-full" style={{ whiteSpace: "pre-wrap" }}>
                        {(place !== "pagePost") ? data.what : data.text}
                    </section>
                    {(loggedInId > 0 && fromAdmin != true) ?
                        <div>
                            <Popup
                                trigger={<div className='w-full text-center'>Do you want to share share your opinion? <button className="button"> Click here! </button></div>}
                                modal
                            >
                                {close => (
                                    <div className="modal">
                                        <button className="close" onClick={close}>
                                            &times;
                                        </button>
                                        <div className="header"> Add New Reply </div>
                                        <div className="content text-center">
                                            <form onSubmit={addNewReply}>
                                                <section className='w-full'>
                                                    <textarea rows="15" placeholder="Description" autoComplete="off" maxLength="3000" value={newReply} onChange={(e) => setNewReply(e.target.value)} className="w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                                                </section>
                                                <button type="submit" className='w-fit'>Upload New Reply</button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </Popup>
                        </div>
                        : null}
                    {(fromAdmin != true && loggedInId > 0) && <Reactions place={place} data={data} loggedInId={loggedInId} where={"Comment"} />}
                    <section className='w-full mt-4'>
                        {(fromAdmin == true || typeof replies === "undefined" || replies.length == 0) ? null : <button onClick={() => { setRepliesShow(!repliesShow) }}>{(repliesShow ? "Hide Replies" : "Show Replies")}</button>}
                        {(repliesShow && fromAdmin != true) ?
                            <section className='w-full h-fit max-h-96 overflow-y-auto'>
                                {replies.map((rep) => {
                                    return <Reply key={rep.id} data={rep} place={place} refreshFunc={refresh} />
                                })}
                            </section>
                            : null
                        }
                    </section>

                </div>
            </div> : null}

        </div>
    ) : null
}

export default Comment
