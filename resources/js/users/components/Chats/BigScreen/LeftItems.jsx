import React, { useEffect, useState } from 'react'
import ThingProfName from '../../UseMoreFromMOreComponents/ThingProfName'
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from 'react-redux'

function LeftItems({ actual, member, setterActual, reSortLeftItems }) {
    const loggedInID = useSelector((state) => state.user.id)
    const [seen, setSeen] = useState(false)
    const [message, setMessage] = useState(member.datas.messageData)

    /* This is a `useEffect` hook that is used to listen for events on a channel. It listens for three
    events: `seenMessage`, `newMessage`, and `updateMessage`. */
    useEffect(() => {
        if (member.type == "user") {
            member.channel.listen('.seenMessage', (e) => {
                setMessage(e.message)
                setSeen(true)
            })
        }
    }, [actual.channel.name])

    /**
     * The function renders a message with emotes in a React component.
     * @returns A React component that renders a div with the inner HTML set to the converted message
     * text.
     */
    const renderMessage = (unConverted) => {
        let containsEmote = unConverted
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
                            text += Stringarray[i]
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
        <div className={"mb-1 cursor-pointer "} onClick={() => {
            if (typeof updateSentMessageLeftItem != "undefined") {
                setterActual(member)
            }
        }}>
            <ThingProfName member={member} fromMessages={true} />
            <section className='w-full'>
                <span className=' truncate block w-8/12 leading-6 float-left'>
                    {(message.isFile == false) ? renderMessage(message.textURI) : "Media Content"}
                </span>
                <span className=' truncate block w-4/12 leading-6'>
                    {(member.type != "groupChat" && (message.seen == true || seen == true) && message.whouserID == loggedInID) ? <VisibilityIcon /> : <span>&nbsp;</span>}
                </span>
            </section>
            <section className='w-full'>
                <span className=' truncate block w-full leading-6'>
                    Sent: {(member.type != "groupChat") ? message.sentData.substring(5, 16) : message.date.substring(5, 16)}
                </span>
            </section>
        </div>
    )
}

export default LeftItems
