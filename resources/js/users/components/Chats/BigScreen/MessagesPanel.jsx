import axios from 'axios'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import MessageBlock from './MessageBlock'
import AttachFileTwoToneIcon from '@mui/icons-material/AttachFileTwoTone';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SendIcon from '@mui/icons-material/Send';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import UploadedContent from '../UploadedContent';
import DateTimeFormatter from '../../UseMoreFromMOreComponents/DateTimeFormatter';
import { useAlert } from 'react-alert';

function MessagesPanel({ actual, userEmotes }) {
    const loggedInID = useSelector((state) => state.user.id)
    const [text, setText] = useState('')
    const [isTyping, setIsTyping] = useState({ who: "", typing: false })
    const [messages, setMessages] = useState([])
    const [allEmoteOrOthers, setAllEmoteOrOthers] = useState([])
    const [custom, setCustom] = useState([
        {
            id: 'Personal',
            name: 'Personal emotes',
            emojis: [
            ]
        }
    ])
    const [profPic, setProfPic] = useState()
    const [openEmoji, setOpenEmojis] = useState(false)
    const messagesEndRef = useRef(null)
    const messagepanel = useRef(null)
    const input = useRef(null)
    const [messageFile, setMessageFile] = useState([]);
    const [messageFileImage, setMessageFileImage] = useState([]);
    const [members, setMember] = useState([]);
    const alerts = useAlert()
    /**
     * This function sets messages by either adding an item or removing an item based on a boolean
     * value.
     */
    const settingMessages = (item, wannaRemoveRemove) => {
        if (wannaRemoveRemove) {
            setMessages(messages => messages.filter((message) => {
                return message.id != item.id
            }))
        } else {
            setMessages(messages => [...messages, item])
        }
    }

    /* The above code is a React useEffect hook that is fetching data from two different API endpoints
    using axios. The first API endpoint is used to fetch the profile picture of a user or group
    chat, and the second API endpoint is used to fetch personal emotes for a user or all members of
    a group chat. The code also sets the state for the fetched data and resets the typing status.
    The useEffect hook is triggered whenever the name of the channel changes. */
    useEffect(() => {
        let thingID = (typeof actual.user1ID != "undefined" && typeof actual.user2ID != "undefined") ? ((loggedInID == actual.user1ID) ? actual.user2ID : actual.user1ID) : ((typeof actual.groupChatID != "undefined") ? actual.groupChatID : actual.id)
        axios.get('/api/profilepics/showActual/' + ((typeof actual.user1ID != "undefined" || actual.type == "user") ? "user" : "groupChat") + '/' + thingID).then((res) => {
            setProfPic(res.data)
        }).catch((err) => {
            console.log(err)
        })
        axios.get('/api/personalemote/' + ((typeof actual.user1ID != "undefined" || actual.type == "user") ? "all/" : "allInGoups/") + thingID).then((res) => {
            if (typeof actual.user1ID != "undefined" || actual.type == "user") {
                setAllEmoteOrOthers(res.data)
            } else {
                let helper = [...res.data]
                let correctres = []
                helper.map((member) => {
                    correctres = [
                        ...correctres,
                        ...member.emotes
                    ]
                })
                setAllEmoteOrOthers(correctres)
            }
        }).catch((err) => {
            console.log(err)
        })
        setIsTyping({ who: "", typing: false })
    }, [actual.channel.name])

    /* The above code is a React useEffect hook that is triggered when the value of
    `actual.channel.name` changes. It makes API calls to retrieve messages and sets the state of
    `messages` using the retrieved data. It also sets the state of `text` to an empty string. The
    code then listens for various events using Pusher channels, such as new messages, destroyed
    messages, updated messages, and seen messages. It also listens for a whisper event called
    "typing" and sets the state of `isTyping` accordingly. Finally, it calls the `setSeen` function. */
    useEffect(async () => {
        if (actual.type == "groupChat") {
            axios.get('/api/groupchatmessage/all/' + actual.datas.groupChatID).then(async (res) => {
                let filtered = await res.data.sort((a, b) => {
                    let aa = Date.parse(a.date)
                    let bb = Date.parse(b.date)
                    return (aa - bb)
                });
                setMessages(filtered)
            }).catch((err) => {
                console.log(err)
            })
        } else {
            axios.get('/api/messagedata/all/' + actual.datas.id).then(async (res) => {
                let filtered = await res.data.sort((a, b) => {
                    let aa = Date.parse(a.sentData)
                    let bb = Date.parse(b.sentData)
                    return (aa - bb)
                });
                setMessages(filtered)
            }).catch((err) => {
                console.log(err)
            })
        }
        setText('')
        actual.channel.listen('.newMessage', (e) => {
            const gottedID = (typeof e.message.whouserID == "undefined") ? e.message.userID : e.message.whouserID
            if (gottedID != loggedInID) {
                settingMessages(e.message, false)
            }
        }).listen('.destroyMessage', (e) => {
            if (e.message.whouserID != loggedInID) {
                settingMessages(e.message, true)
            }
        }).listen('.updateMessage', (e) => {
            setMessages(messages => messages.map((message) => {
                if (message.id == e.message.id) {
                    message.textURI = e.message.textURI
                }
                return message
            }))
        }).listen('.seenMessage', (e) => {
            setMessages(messages => messages.map((message) => {
                if (message.id == e.message.id) {
                    message = e.message
                }
                return message
            }))
        }).listenForWhisper('typing', (e) => {
            if (actual.type == "user") {
                setIsTyping({ who: actual.name, typing: e.typing })
            } else {
                setIsTyping({ who: "Someone", typing: e.typing })
            }
        })
        setSeen()
    }, [actual.channel.name])

/* The above code is defining a function called `setSeen` using the `useCallback` hook in React. The
function checks if the `actual` object has a `type` property with the value of "user". If it does,
it sends a POST request to a specific API endpoint using Axios, passing in the `actual.id` and
`loggedInID` as parameters. If there is an error, it logs the error to the console. */

    const setSeen = useCallback(() => {
        if (actual.type === "user") {
            axios
                .post("/api/messagedata/setseen/" + actual.id + "/" + loggedInID)
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [actual.id, actual.type, loggedInID]);

    /* The above code is using the `useEffect` hook in a React component to set a timeout of 5 seconds
    (5000 milliseconds) and then call the `setSeen` function. The `setSeen` function is likely
    updating some state in the component. The `useEffect` hook also returns a cleanup function that
    clears the timeout when the component unmounts or when the `setSeen` function is called again.
    The `setSeen` function is a dependency of the `useEffect` hook, so the effect will be re-run
    whenever `setSeen` changes. */
    useEffect(() => {
        let timeoutId = setTimeout(() => {
            setSeen();
        }, 5000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [setSeen]);

    /* The above code is a React useEffect hook that is triggered when the value of
    `actual.channel.name` changes. It sets the `member` state to an empty array, then makes an HTTP
    GET request to retrieve data about members of a group chat using the `axios` library. If the
    `actual.type` is not "user", it calls the `getMembersData` function to retrieve the data.
    Finally, it returns a cleanup function that sets the `member` state to an empty array. */
    useEffect(() => {
        setMember([])
        const getMembersData = () => {
            axios.get('/api/groupchathelper/all/userByGroup/' + actual.groupChatID).then((res) => {
                setMember(res.data)
            }).catch((err) => {
                console.log(err)
            })
        }

        if (actual.type != "user") {
            getMembersData();
        }

        return () => {
            setMember([]);
        }
    }, [actual.channel.name])



    /* The above code is using the `useEffect` hook in a React component to send a whisper message to a
    channel in a chat application. The message contains information about whether the user is typing
    or not, the type of chat (user or group), the ID of the logged-in user, and the name of the
    channel. The `useEffect` hook is triggered whenever the `actual.channel.name` or `text`
    variables change. */
    useEffect(() => {
        actual.channel.whisper('typing', {
            type: (actual.type == "user") ? "user" : "groupChat",
            fromUser: loggedInID,
            typing: text.length > 0 && (text.trim() != '' || text.length > 1),
            channelName: actual.channel.name
        })
    }, [actual.channel.name, text])

    /* The above code is using the `useLayoutEffect` hook in a React component. It is triggered
    whenever the `messages` array length changes. */
    useLayoutEffect(() => {
        setOpenEmojis(false);
        scrollToBottom();
      }, [messages.length]);

    /**
     * The function scrolls to the bottom of a messages container with a smooth behavior.
     */
    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    /**
     * This function handles sending messages and image uploads in a chat application.
     */
    function handleOnEnter() {
        if (actual.type == "user") {
            if (text != "") {
                axios.post('/api/messagedata/new', {
                    whouserID: loggedInID,
                    messageID: actual.datas.id,
                    textURI: text,
                    edited: false
                }).then((res) => {
                    settingMessages(res.data, false)
                }).catch((err) => {
                    console.log(err)
                })
            }
        } else {
            if (text != "") {
                axios.post('/api/groupchatmessage/new', {
                    userID: loggedInID,
                    groupChatID: actual.datas.groupChatID,
                    textURI: text
                }).then((res) => {
                    settingMessages(res.data, false)
                }).catch((err) => {
                    console.log(err)
                })
            }
        }
        if (messageFile.length > 0) {
            imageUploader()
        }
        setText('')
        setOpenEmojis(false)
    }
   /**
    * The function uploads image files to a server using Axios and FormData.
    */
    const imageUploader = () => {
        if (messageFile.length > 0) {
            for (let i = 0; i < messageFile.length; i++) {
                let fd = new FormData()
                if (actual.type == "user") {
                    fd.append('whouserID', loggedInID)
                    fd.append('messageID', actual.datas.id)
                    fd.append('textURI', "Placeholder")
                    fd.append('edited', false)
                    fd.append('image', messageFile[i])
                } else {
                    fd.append('userID', loggedInID)
                    fd.append('groupChatID', actual.datas.groupChatID)
                    fd.append('textURI', messageFile[i])
                }
                axios.post('/api/' + (((actual.type == "user") ? 'messagedata' : 'groupchatmessage') + '/new'), fd, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }).then((response) => {
                    settingMessages(response.data, false)
                }).catch(err => {
                    alerts.error("Image can not be upladed")
                    console.log(err.message)
                })
            }
        }
        setMessageFile([])
        setMessageFileImage([])
    }
   /**
    * The function toggles the state of a variable called "openEmoji".
    */
    const handleEmojis = () => {
        setOpenEmojis(!openEmoji)
    }
    /**
     * This function adds emojis to a text string.
     */
    const handleEmojisAdding = (e) => {
        if (typeof e.native != "undefined") {
            setText(text + "" + e.native)
        } else {
            setText(text + "#" + e.id + "#")
        }
    }

   /* The above code is using the `useEffect` hook in a React component to modify an array of user
   emotes and add them to a custom array. It first creates a copy of the `userEmotes` array using
   the spread operator, then maps over each emote in the array to add an `id`, `name`, `keywords`,
   and `skins` property to it. It then creates a copy of the `custom` array using the spread
   operator, and sets the `emojis` property of the first element in the array to the modified
   `helper` array. Finally, it */
    useEffect(async () => {
        let helper = await [...userEmotes]
        await helper.map((emote) => {
            emote.id = emote.name + "" + emote.id
            emote.name = emote.name
            emote.keywords = ['Personal']
            emote.skins = [{ src: emote.emoteURI }]
        })
        let helping = await [...custom]
        helping[0].emojis = await [...helper]
        setCustom(helping)
    }, [userEmotes.length])

   /* The above code is a React useEffect hook that is triggered whenever the `messageFile` state
   variable changes. It checks if the length of `messageFile` is less than 1, and if so, it sets the
   `messageFileImage` state variable to an empty array. It then creates an array of objects
   containing the URL and image file for each file in `messageFile`, using the
   `URL.createObjectURL()` method. Finally, it sets the `messageFileImage` state variable to the new
   array of image URLs and files. This code is likely used to display images that have been uploaded */
    useEffect(() => {
        if (messageFile.length < 1) {
            setMessageFileImage([]);
        }
        const newImageUrls = [];
        messageFile.forEach((image) => newImageUrls.push({ url: URL.createObjectURL(image), image: image }));
        setMessageFileImage(newImageUrls);
    }, [messageFile])

    /**
     * The function removes an item from a list of messages.
     */
    const RemoveFromList = (item) => {
        let helper = messageFile.filter((image) => {
            return image.name != item.image.name
        })
        setMessageFile(helper)
    }
    /**
     * The function renders the name and profile picture of a sender based on their ID.
     * @returns A JSX element containing the sender's name and profile picture, wrapped in a section
     * element with the class 'text-left'. If the senderID does not match any member's userID, null is
     * returned.
     */
    const renderSender = (senderID) => {
        let senderUser = members.filter((member) => {
            return member.userID == senderID
        })
        if (senderUser.length != 0) {
            senderUser = senderUser[0]
        } else {
            return null
        }
        return (
            <section className='text-left'>
                <img src={senderUser.ProfilePicURI.ProfilePicURI} className="block rounded-full h-5 w-5 float-left text-sm" />
                <span>
                    {
                        senderUser.name
                    }
                </span>
            </section>
        )
    }
    /* The above code defines a function called `renderMessages` which returns a JSX element. The
    function iterates over an array of `messages` and creates a new array of JSX elements for each
    message. Each message element includes a date/time stamp, sender information (if applicable),
    and the message content itself. The function also includes a conditional statement to display a
    "seen" indicator for the last message if it has been seen by the logged-in user. */
    const renderMessages = () => {
        const rows = [];
        for (let i = 0; i < messages.length; i++) {
            rows.push(
                <div className='w-full h-auto' key={messages[i].id}>
                    {
                        (i == 0) ? <section className='text-center text-sm'>
                            <DateTimeFormatter sentDate={(typeof messages[i].sentData == "undefined") ? messages[i].date : messages[i].sentData} />
                        </section> : (
                            (Math.abs(new Date(((typeof messages[i - 1].sentData == "undefined") ? messages[i - 1].date : messages[i - 1].sentData)) - new Date(((typeof messages[i].sentData == "undefined") ? messages[i].date : messages[i].sentData))) > 3600000) ? <section className='text-center text-sm'>
                                <DateTimeFormatter sentDate={(typeof messages[i].sentData == "undefined") ? messages[i].date : messages[i].sentData} />
                            </section> : null
                        )
                    }
                    {
                        (i != 0 && actual.type != "user" && messages[i].userID != loggedInID) ? (
                            <div className='w-full text-left text-sm truncate'>
                                {
                                    (typeof messages[i].userID != "groupChatID") ? renderSender(messages[i].userID) : null
                                }
                            </div>
                        ) : (
                            (actual.type != "user" && messages[i].userID != loggedInID) ? (
                                <div className='w-full text-left text-sm truncate'>
                                    {
                                        (typeof messages[i].userID != "groupChatID") ? renderSender(messages[i].userID) : null
                                    }
                                </div>
                            ) : null
                        )
                    }
                    <MessageBlock message={messages[i]} role={actual.role} type={actual.type} settingMessages={settingMessages} userEmotes={userEmotes} allEmoteOrOthers={allEmoteOrOthers} />
                </div>
            )
        }
        return <div className="w-full h-full">
            {rows}
            {
                actual.type === 'user' && messages.length > 0 && messages[messages.length - 1].whouserID === loggedInID && messages[messages.length - 1].seen ? (
                    <div className='w-full text-right text-sm'>
                        Seen: <DateTimeFormatter sentDate={messages[messages.length - 1].seenData} />
                    </div>
                ) : null
            }
        </div>;
    }
    return (
        <div className='w-full h-full' onFocus={() => { setSeen() }}>
            <div className='w-full pb-5' style={{ height: '10%', maxHeight: 70 }}>
                {(typeof profPic != "undefined") ? <img src={profPic.profilePicURI} alt={actual.name} className="h-12 float-left" /> : <span className="h-14 float-left">&nbsp;</span>}
                <h1 className="pb-2 text-lg truncate block leading-10 pl-3">
                    {actual.name}
                </h1>
            </div>
            <div className='relative w-auto px-3 pb-9' style={{ height: '75%', maxHeight: "99%" }}>
                <div className="absolute bottom-0 z-[100]">
                    {(openEmoji) ? <Picker
                        data={data}
                        custom={(custom.length > 0) ? custom : null}
                        onEmojiSelect={handleEmojisAdding}
                    /> : null}
                </div>
                <div className="absolute bottom-0 z-[99] overflow-x-scroll mx-3 flex flex-row ">
                    {messageFileImage.map((item) => {
                        return <UploadedContent item={item} key={item.url} RemoveFromList={RemoveFromList} />
                    })}
                </div>
                <div className='w-full max-h-full overflow-y-auto relative' ref={messagepanel}>
                    {
                        renderMessages()
                    }
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="w-full px-1" style={{ height: '15%', maxHeight: 100 }}>
                <div className="w-full">
                    <span className="truncate block">
                        {(isTyping.typing == true) ? (isTyping.who + " is typing...") : <span>&nbsp;</span>}
                    </span>
                </div>
                <div className='w-full float-left flex'>
                    <div className='item w-9/12'>
                        <textarea maxLength={2048} className='w-full h-fit float-left rounded-md text-gray-900'
                            value={text}
                            ref={input}
                            onChange={(e) => {
                                setText(e.target.value)
                            }}
                            onKeyDown={(e) => {
                                if (e.keyCode === 13 && e.shiftKey) {
                                    setText(e.target.value)
                                } else if (e.keyCode === 13) {
                                    handleOnEnter()
                                }
                            }}
                        />
                    </div>
                    <div className='item w-3/12 flex justify-between text-nav-popup-color'>
                        <input  className=' text-gray-900' type="file" accept="image/*, video/mp4, video/ogv, video/ogg, video/webm" multiple id="selectedFile" style={{ display: "none" }} onChange={(e) => setMessageFile(Array.prototype.slice.call(e.target.files))} />
                        <SendIcon onClick={handleOnEnter} className='mt-3 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer mx-auto' />
                        <AttachFileTwoToneIcon onClick={() => { document.getElementById('selectedFile').click() }} className='mt-3 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer' />
                        <EmojiEmotionsIcon onClick={handleEmojis} className=' mt-3 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer mx-auto' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MessagesPanel
