import React from 'react'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../sass/popup.css'
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';

function ContentElement({ content, removeElement }) {
    const [userData, setUserData] = useState({})
    /**
     * The function checks if a given URI is an image or video and returns the appropriate HTML
     * element.
     * @returns The function `sendImageOrVideo` returns a JSX element that displays either an image or
     * a video depending on the file extension of the `content.textURI` string. If the file extension
     * is `.jpeg`, `.png`, `.jpg`, or `.gif`, an `img` element is returned with the `src` attribute set
     * to the `content.textURI` value. Otherwise, a `video
     */
    const sendImageOrVideo = () => {
        if (content.textURI.endsWith('.jpeg') || content.textURI.endsWith('.png') || content.textURI.endsWith('.jpg') || content.textURI.endsWith('.gif')) {
            return <div className='block'>
                <img src={content.textURI} alt="Image in the chat" />
            </div>
        } else {
            return <div className='block'>
                <video controls>
                    <source src={content.textURI} />
                    Video Format not supported!
                </video>
            </div>
        }
    }
    /* This is a React hook called `useEffect` that is used to perform side effects in a functional
    component. In this specific code, it is used to fetch user data from an API endpoint using Axios
    when the component mounts. The `getUserData` function is called inside the `useEffect` hook,
    which makes an HTTP GET request to the API endpoint and sets the user data in the component
    state using the `setUserData` function. The `[]` as the second argument to `useEffect` means
    that the effect will only run once when the component mounts. The `return` statement inside the
    `useEffect` hook is used to clean up the effect by resetting the `userData` state to an empty
    object. */
    useEffect(() => {
        const getUserData = () => {
            axios.get('/api/usersNeeded/' + ((typeof content.messageID == "undefined") ? content.userID : content.whouserID)).then((res) => {
                setUserData(res.data);
            }).catch((err) => {
                console.log(err)
            })
        }

        getUserData();

        return () => {
            setUserData({});
        }
    }, []);

   /**
    * This function sends a delete request to the server to remove a message from a group chat or a
    * direct message and then removes the message element from the UI.
    */
    const RemoveContent = () => {
        axios.delete("/api/" + ((typeof content.groupChatID != "undefined") ? "groupchatmessage" : "messagedata") + "/delete/" + content.id).then(() => {
            removeElement(content)
        }).catch(err => {
            console.log(err)
        })

    }
    return (userData.tag != undefined) ? (
        <div className='w-full relative'>
            <Popup
                trigger={<div className='w-full text-center'><button className="button"> {sendImageOrVideo()} </button></div>}
                modal
            >
                {close => (
                    <div className="modal">
                        <button className="close" onClick={close}>
                            &times;
                        </button>
                        <div className="content text-center flex flex-row">
                            <div className='w-9/12 h-full text-center'>
                                {sendImageOrVideo()}
                            </div>
                            <div className='w-2/12 h-full'>
                                <section className='block truncate'>
                                    Who: <br />
                                    {userData.tag}
                                </section>
                                <section>
                                    Sent: <br />
                                    {((typeof content.messageID == "undefined") ? content.date : content.sentData).substring(5, 16)}
                                </section>
                                <section>
                                    <button className="" onClick={() => { RemoveContent() }}>
                                        Delete Image <DeleteForeverTwoToneIcon />
                                    </button>
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </Popup>

        </div>
    ) : null
}
export default ContentElement
