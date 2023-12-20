import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DateTimeFormatter from '../UseMoreFromMOreComponents/DateTimeFormatter'

function AlertElement({ data, negalTheAlertOpened }) {
  const [user, setUser] = useState([])
  const [messageAndNumber, setMessageAndNumber] = useState({ message: "", number: 0, url: "" })
  /* This is a `useEffect` hook that runs whenever the `data.id` prop changes. It sets the `user` state
  to an empty array, and then defines a function `getUserAndExtractMessage` that extracts
  information from the `data.message` prop using a regular expression. If the regular expression
  matches and the `data.userID` prop is greater than 0, it sets the `messageAndNumber` state with
  the extracted message and number, and makes an API call to get user information using the
  extracted number. If the `data.userID` prop is 1, it sets the `messageAndNumber` state with a
  number of -1 and an empty URL. Finally, it returns a cleanup function that sets the `user` state
  to an empty array. */
  useEffect(() => {
    setUser([])
    const getUserAndExtractMessage = () => {
      const regex = /{(\d+)}([\w\s]+)(?:{\/(\w+)\/(\w+)\/(\d+)})?/
      const match = data.message.match(regex)

      if (match && data.userID > 0) {
        const number = parseInt(match[1])
        const message = match[2]
        let thingURL = ""
        if (match[3] && match[4] && match[5]) {
          thingURL = '/' + match[3] + '/' + match[4] + '/' + match[5]
        } else {
          thingURL = "";
        }
        setMessageAndNumber({
          message: message,
          number: number,
          url: thingURL
        })

        axios.get("/api/usersNeeded/" + match[1]).then((res) => {
          setUser(res.data)
        }).catch((err) => {
          console.log(err)
        })
      } else if (data.userID == 1) {
        setMessageAndNumber({
          message: message,
          number: -1,
          url: ""
        })
      }
    }
    getUserAndExtractMessage()
    return () => {
      setUser([]);
    }
  }, [data.id])
  /* `renderElement` is a function that returns a JSX element. The element contains a div with a class
  name of 'w-full h-fit px-4 flex' and an onClick event that calls the `negalTheAlertOpened`
  function. Inside the div, there are two child divs. The first child div has a class name of
  'w-9/12 text-left truncate flex items-center' and contains an image and a span element. The image
  is conditionally rendered based on the `messageAndNumber.number` and `user.ProfilePicURI` values.
  If `messageAndNumber.number` is greater than 0 and `user.ProfilePicURI` is not undefined, the
  image is displayed with the source set to `user.ProfilePicURI.profilePicURI`. If
  `messageAndNumber.number` is equal to -1, a system image is displayed. If neither condition is
  met, nothing is displayed. The span element displays the `messageAndNumber.message` value. The
  second child div has a class name of 'w-3/12 text-right flex items-center justify-end' and
  contains a `DateTimeFormatter` component with a `sentDate` prop set to `data */
  const renderElement = () => {
    return (
      <div className='w-full h-fit px-4 flex' onClick={() => { negalTheAlertOpened() }}>
        <div className='w-9/12 text-left truncate flex items-center'>
          {(messageAndNumber.number > 0 && typeof user.ProfilePicURI != "undefined") ? (
            <div className='w-fit float-left mr-3 bg-profImage-bg-color rounded-full h-8 shadow-smaller m-2'>
              <img src={user.ProfilePicURI.profilePicURI} className="block rounded-full w-8 h-8" />
            </div>
          ) : (
            (messageAndNumber.number == -1) ? (
              <div className='w-fit float-left mr-3 bg-profImage-bg-color rounded-full h-8 shadow-smaller m-2'>
                <img src={'/images/system.png'} className="block rounded-full w-8 h-8" />
              </div>
            ) : null
          )}
          <span className=''>
            {messageAndNumber.message}
          </span>
        </div>
        <div className='w-3/12 text-right flex items-center justify-end'>
          <DateTimeFormatter sentDate={data.sentDate} />
        </div>
      </div>
    )
  }
  return (messageAndNumber.url.length != 0) ? (
    <Link to={messageAndNumber.url}>
      {renderElement()}
    </Link>
  ) : ((typeof user.tag != "undefined") ? (
    <Link to={'/users/' + user.tag}>
      {renderElement()}
    </Link>
  ) : (
    renderElement()
  )
  )
}

export default AlertElement

