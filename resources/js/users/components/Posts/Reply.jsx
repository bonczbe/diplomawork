import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAlert } from "react-alert"
import axios from 'axios'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../sass/popup.css'
import Reactions from './Reactions';
import ReportButton from '../UseMoreFromMOreComponents/ReportButton'

function Reply({ data, place, refreshFunc, fromAdmin }) {
    let loggedInId = 0
    if (fromAdmin != true) {
        loggedInId = useSelector((state) => state.user.id)
    }
    const alerts = useAlert()
    const [isBlocked, setIsBlocked] = useState(false)
    const [editText, setEditText] = useState("")
    const [reportedByUser, setReportedByUser] = useState(false)

    const setterReportedByUser = (fromcalled) => {
        setReportedByUser(fromcalled)
    }

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
        var editText = data.what
        setEditText(editText)
    }, [])

    const deleteReply = () => {
        switch (place) {
            case 'normalPost':
                axios.delete('/api/replies/delete/' + data.id).then(() => {
                    alerts.success("Reply Removed")
                    refreshFunc(data)
                }).catch((error) => {
                    alerts.error("Reply deletion failed")
                    console.log(error);
                });
                break;
            case 'pagePost':
                axios.delete('/api/pagepostreply/delete/' + data.id).then(() => {
                    alerts.success("Reply Removed")
                    refreshFunc(data)
                }).catch((error) => {
                    alerts.error("Reply deletion failed")
                    console.log(error);
                });
                break;
            case 'groupPost':
                axios.delete('/api/grouppostreply/delete/' + data.id).then(() => {
                    alerts.success("Reply Removed")
                    refreshFunc(data)
                }).catch((error) => {
                    alerts.error("Reply deletion failed")
                    console.log(error);
                });
                break;
            default:
                break;
        }
    }
    const replyEditing = (e) => {
        e.preventDefault()
        switch (place) {
            case 'normalPost':
                axios.put('/api/replies/update/' + data.id, {
                    what: editText
                }).then(() => {
                    alerts.success("Reply Updated")
                }).catch(() => {
                    alerts.error("Something went wrong!")
                })
                break;
            case 'pagePost':
                axios.put('/api/pagepostreply/update/' + data.id, {
                    what: editText
                }).then(() => {
                    alerts.success("Reply Updated")
                }).catch(() => {
                    alerts.error("Something went wrong!")
                })
                break;
            case 'groupPost':
                axios.put('/api/grouppostreply/update/' + data.id, {
                    what: editText
                }).then(() => {
                    alerts.success("Reply Updated")
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
                <hr className='pb-3 ' />
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
                            trigger={<div className='w-full text-center'><button className="button"> Edit Reply </button></div>}
                            modal
                        >
                            {close => (
                                <div className="modal" >
                                    <button className="close" onClick={close}>
                                        &times;
                                    </button>
                                    <div className="header"> Editing your reply </div>
                                    <div className="content text-center">
                                        <form onSubmit={replyEditing}>
                                            <section className='w-full'>
                                                <textarea required rows="15" placeholder="Description" autoComplete="off" maxLength="3000" value={editText} style={{ whiteSpace: "pre-wrap" }} onChange={(e) => setEditText(e.target.value)} className="w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                                            </section>
                                            <button type="submit" className='w-fit'>Update your Reply</button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </Popup>
                        <button onClick={() => { deleteReply() }}>Delete Reply</button>
                    </div>
                    : <div>
                        {(fromAdmin != true) && <ReportButton fromWhere={((place == "normalPost") ? ("normalReply") : ((place == "pagePost") ? ("pageReply") : ((place == "groupPost") ? ("groupReply") : ("trash"))))} setterReportedByUser={setterReportedByUser} outsideID={data.id} />}
                    </div>}
                <div className='w-full px-10 py-4'>
                    <section className="w-full" style={{ whiteSpace: "pre-wrap" }}>
                        {data.what}
                    </section>

                </div>
                {(fromAdmin != true && loggedInId > 0) && <Reactions place={place} data={data} loggedInId={loggedInId} where={"Reply"} />}
            </div> : null}

        </div>
    ) : null
}

export default Reply
