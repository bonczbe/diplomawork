import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import axios from 'axios';

function MessageBlock({ message, role, type, settingMessages, userEmotes, allEmoteOrOthers }) {
    const loggedInID = useSelector((state) => state.user.id)
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const FromUser = (type == "user") ? (message.whouserID == loggedInID) : (message.userID == loggedInID)

    /* This `useEffect` hook is used to clean up the `timeoutId` when the component unmounts or when
    the `timeoutId` value changes. It returns a function that clears the timeout using
    `clearTimeout` when the component unmounts or when the `timeoutId` value changes. This is
    important to prevent memory leaks and ensure that the timeout is properly cleared when the
    component is no longer in use. */
    useEffect(() => {
        return () => {
            clearTimeout(timeoutId);
        };
    }, [timeoutId]);

    /**
     * The function sets a timeout to show a popup after 2 seconds when the mouse is hovered over an
     * element.
     */
    function handleMouseOver() {
        clearTimeout(timeoutId);

        const newTimeoutId = setTimeout(() => {
            setIsPopupVisible(true);
        }, 2000);

        setTimeoutId(newTimeoutId);
    }

   /**
    * This function hides a popup when the mouse moves out of its area.
    */
    function handleMouseOut() {
        clearTimeout(timeoutId);

        setIsPopupVisible(false);
    }

    /**
     * The function removes a message from either a user or group chat using axios and updates the
     * messages setting.
     */
    const removeMessage = () => {
        if (type == "user") {
            axios.delete('/api/messagedata/delete/' + message.id)
        } else {
            axios.delete('/api/groupchatmessage/delete/' + message.id)
        }
        settingMessages(message, true)
    }
    /**
     * The function checks if a message contains an image or video file and renders it accordingly.
     * @returns The function `renderFile` returns a JSX element that displays either an image or a
     * video depending on the file extension of the `message.textURI` passed to it. If the file
     * extension is `.jpeg`, `.png`, `.jpg`, or `.gif`, it returns an `img` element with the `src`
     * attribute set to `message.textURI`. If the file extension is not one of
     */
    const renderFile = () => {
        if (message.textURI.endsWith('.jpeg') || message.textURI.endsWith('.png') || message.textURI.endsWith('.jpg') || message.textURI.endsWith('.gif')) {
            return <div className='w-full h-fit'>
                <img src={message.textURI} alt="Image in the chat" className='w-full h-32'/>
            </div>
        } else {
            return <div className='w-full h-fit'>
                <video className='w-full h-32' controls>
                    <source src={message.textURI} />
                    Video Format not supported!
                </video>
            </div>
        }
    }
    /**
     * The function checks if a given string is an emote and returns the corresponding HTML code for
     * the emote image.
     * @returns The function `isEmote` returns a string that represents an HTML element containing an
     * image tag with the source and alt attributes set based on the input `possible`. The function
     * checks if `possible` matches an `id` of an emote in either `userEmotes` or `allEmoteOrOthers`
     * arrays, and if it does, it returns the corresponding image tag. If `
     */
    const isEmote = (possible) => {
        let answer = ""
        let userID = (typeof message.whouserID == "undefined") ? message.userID : message.whouserID
        if (userID == loggedInID) {
            userEmotes.map((emote) => {
                if (emote.id == possible) {
                    answer = "<span class='leading-10'><img src=" + emote.emoteURI + " alt=" + emote.name + " class='h-4 inline-block'/></span>"
                }
            })
            if (answer.length == 0) {
                answer = "#" + possible + "#"
            }
        } else {
            allEmoteOrOthers.map((emote) => {
                if (emote.user == userID) {
                    if (emote.name + "" + emote.id == possible) {
                        answer = "<span class='leading-10'><img src=" + emote.emoteURI + " alt=" + emote.name + "  class='h-4 inline-block'/></span>"
                    }
                }
            })
            if (answer.length == 0) {
                answer = "#" + possible + "#"
            }
        }

        return answer
    }
   /**
    * The function renders a message with emotes in a React component.
    * @returns A React component that renders a message with emotes. The message is processed to
    * replace hashtags with corresponding emotes, if available. The processed message is then rendered
    * using the `dangerouslySetInnerHTML` prop.
    */
    const renderMessage = () => {
        let containsEmote = message.textURI
        let text = ""
        if (containsEmote.replace(/[^#]/g, "").length > 1) {
            let Stringarray = containsEmote.split(/(?=[#])|(?<=[#])/g)
            text += Stringarray[0]
            let afterHash = false
            for (let i = 1; i < Stringarray.length - 1; i++) {
                if (afterHash) {
                    afterHash = false
                } else {
                    if (Stringarray[i - 1] == "#" && Stringarray[i + 1] == "#" && !Stringarray[i].includes(' ')) {
                        if (Stringarray[i] == "#") {
                            text += Stringarray[i]
                        } else {
                            text = text.slice(0, -1)
                            text += isEmote(Stringarray[i])
                            afterHash = true
                        }
                    } else {
                        text += Stringarray[i]
                    }
                }
            }
            if (!afterHash) text += Stringarray[Stringarray.length - 1]
        } else {
            text = message.textURI
        }
        return <div dangerouslySetInnerHTML={{ __html: text }} />
    }
    return (
        <div className='w-full pb-1 h-fit'>
            <div className={'w-fit h-fit' + (FromUser ? " ml-auto" : '')}>
                {
                    (isPopupVisible) ? <div className={'h-full w-fit bg-white rounded-lg px-1 flex items-center justify-center ' + ((FromUser) ? "float-left" : "float-right")}>
                        {
                            String(new Date(((typeof message.sentData == "undefined") ? message.date : message.sentData)).getHours()).padStart(2, '0')}:{String(new Date(((typeof message.sentData == "undefined") ? message.date : message.sentData)).getMinutes()).padStart(2, '0')
                        }
                    </div> : null
                }
                <div className={'w-fit h-fit p-2 rounded-md bg-chat-elemen-color text-chat-elemen-text-color whitespace-pre-wrap break-all'} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <div className='w-fit h-fit whitespace-pre-wrap flex flex-row'>
                        <div className='w-fit flex items-center justify-center'>
                            {
                                (type == "user" ? (message.whouserID == loggedInID) : (message.userID == loggedInID || (role > 1 && role < 4))) ? (
                                    <button className={(FromUser ? " float-left" : ' float-right')} onClick={() => { removeMessage() }}>
                                        <DeleteForeverTwoToneIcon />
                                    </button>
                                ) : null
                            }
                        </div>
                        {(message.isFile == false) ? renderMessage() : renderFile()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MessageBlock
