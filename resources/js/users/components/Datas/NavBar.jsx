import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import Login from '../OutofLogin/Login'
import Logout from '../OutofLogin/Logout'
import Cookies from 'universal-cookie';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux'
import { login, loading } from '../../Redux/userSlice'
import { setMode } from '../../Redux/settingsSlice'
import ProfPicName from './ProfPicName';
import { WebsocketPrivateChannel } from '../../Service/WebsocketHelper';
import AlertsOnNavBarIsUnreaded from './AlertsOnNavBarIsUnreaded';
import AlertElement from './AlertElement';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';


/* The above code is defining a functional component called `NavBar` in JavaScript React. It is
importing and using various hooks from the `react-redux` library such as `useDispatch` and
`useSelector` to access and update the state of the application. It is also using the `useState`
hook to define and update various state variables such as `text`, `founded`, `actualChannel`,
`alerts`, `alertsUnSeen`, and `alertsOpened`. The component is rendering a navigation bar with
various elements such as a search bar, user information, and alerts. It also defines functions to */
function NavBar() {
  const dispatch = useDispatch()
  const id = useSelector((state) => state.user.id);
  const tag = useSelector((state) => state.user.tag);
  const firstName = useSelector((state) => state.user.firstName);
  const isLoading = useSelector((state) => state.user.isLoading);
  var cookies = new Cookies();
  const [text, setText] = useState("")
  const [founded, setFounded] = useState([])
  const [actualChannel, setActualChannel] = useState({})
  const [alerts, setAlerts] = useState([])
  const [alertsUnSeen, setAlertsUnSeen] = useState(false)
  const [alertsOpened, setAlertsOpened] = useState(false)
  const [isOpen, setIsOpen] = useState(false);
  const setIsOpenFalse = () => {
    setIsOpen(false)
  }


  /**
   * The function `resetText` sets the value of a text variable to an empty string.
   */
  const resetText = () => {
    setText("")
  }

  /**
   * This function toggles the state of a variable called "alertsOpened".
   */
  const negalTheAlertOpened = () => {
    setAlertsOpened(!alertsOpened)
  }
  /* The above code is using the useEffect hook in a React component to check if alerts have been
  opened and unseen, and if so, it sets a timeout of 15 seconds before marking the alerts as seen by
  making a POST request to an API endpoint. It also updates the state of the alerts to mark them as
  seen and sets the alertsUnSeen state to false. The useEffect hook is triggered whenever the
  alertsOpened state changes. */
  useEffect(() => {

    if (alertsOpened == true && alertsUnSeen == true && alertsOpened.length > 0) {
      const timeOutId = setTimeout(() => {
        axios.post("/api/alerts/seen/" + id).then(() => {
          let helper = alerts.map((item) => {
            item.seen = true
            return item
          })
          setAlerts(helper)
          setAlertsUnSeen(false)
        }).catch((err) => {
          console.log(err)
        })
      }, 15000);
      return () => clearTimeout(timeOutId);
    }
  }, [alertsOpened])

  /* The above code is a React useEffect hook that is triggered when the "id" variable changes. It sets
  the "alerts" state to an empty array, then makes an HTTP GET request to retrieve alerts data from
  the server using the "axios" library. If the response data contains alerts that have not been
  seen, it sets the "alertsUnSeen" state to true. It then sets the "alerts" state to the retrieved
  data. The code also sets up a WebSocket listener for private channel "Alerts." + id and sets the
  "actualChannel" state to the created channel. If the */
  useEffect(() => {
    setAlerts([])
    const getAlerts = () => {
      if (id > 0) {
        axios.get('/api/alerts/all/' + id).then(res => {
          if (res.data.length > 0 && res.data[res.data.length - 1].seen == false) {
            setAlertsUnSeen(true)
          }
          setAlerts(res.data)
        }).catch(err => {
          console.log(err)
        })
        try {
          resetListener()
        } catch (e) { }
        const channel = WebsocketPrivateChannel("Alerts." + id)
        setActualChannel(channel)
      } else {
        try {
          resetListener()
        } catch (e) { }
        setActualChannel({})
        setAlertsOpened(false)
        setAlertsOpened(false)
      }
    }

    getAlerts()

    return () => {
      setAlerts([]);
    }
  }, [id])
  /**
   * This function adds a new message to the alerts array and sets a flag to indicate that there are
   * unseen alerts.
   */
  const addToAlerts = (e) => {
    setAlerts(alerts => [e.message, ...alerts])
    setAlertsUnSeen(true)
  }
  /* The above code is using the `useEffect` hook in a React component to listen for various events on
  a channel (`actualChannel`). When an event is received, the `addToAlerts` function is called with
  the event as an argument. The events being listened for include new relations, new posts, new
  comments, new replies, and various actions related to posts, comments, and replies. The
  `useEffect` hook is also dependent on the `actualChannel` variable, so it will re-run whenever
  `actualChannel` changes. */
  useEffect(() => {
    if (typeof actualChannel != "undefined" && typeof actualChannel.name != "undefined") {
      actualChannel.listen('.newRelation', (e) => {
      }).listen('.Accepted', (e) => {
        addToAlerts(e)
      }).listen('.newPost', (e) => {
        addToAlerts(e)
      }).listen('.newComment', (e) => {
        addToAlerts(e)
      }).listen('.newReply', (e) => {
        addToAlerts(e)
      }).listen('.newGroupPost', (e) => {
        addToAlerts(e)
      }).listen('.newGroupComment', (e) => {
        addToAlerts(e)
      }).listen('.newGroupReply', (e) => {
        addToAlerts(e)
      }).listen('.newPageReply', (e) => {
        addToAlerts(e)
      }).listen('.PostAction', (e) => {
        addToAlerts(e)
      }).listen('.CommentAction', (e) => {
        addToAlerts(e)
      }).listen('.ReplyAction', (e) => {
        addToAlerts(e)
      }).listen('.PageCommentAction', (e) => {
        addToAlerts(e)
      }).listen('.PageReplyAction', (e) => {
        addToAlerts(e)
      }).listen('.GroupCommentAction', (e) => {
        addToAlerts(e)
      }).listen('.GroupReplyAction', (e) => {
        addToAlerts(e)
      }).listen('.System', (e) => {
        addToAlerts(e)
      })
    }
  }, [actualChannel])

  /**
   * The function resets all event listeners for various types of actions in a messaging system.
   */
  const resetListener = () => {
    actualChannel.stopListening('.newRelation').stopListening('.Accepted')
      .stopListening('.newPost').stopListening('.newComment')
      .stopListening('.newReply').stopListening('.PostAction')
      .stopListening('.CommentAction').stopListening('.ReplyAction')
      .stopListening('.PageCommentAction')
      .stopListening('.PageReplyAction').stopListening('.GroupCommentAction')
      .stopListening('.GroupReplyAction')
      .stopListening('.System')
      .stopListening('.newGroupPost')
      .stopListening('.newGroupComment')
      .stopListening('.newGroupReply')
      .stopListening('.newPageReply')
  }


  /* The above code is using the useEffect hook in a React component to perform some authentication and
  login related tasks. */
  useEffect(async () => {
    await axios.get("/sanctum/csrf-cookie")
      .then(() => {
        console.log("Authentication could be successful");
      })
      .catch((error) => {
        console.log(error);
      });
    if (cookies.get('user') && cookies.get('user').email != '') {
      await axios.post('/api/auth/user/login', {
        email: Buffer.from(cookies.get('user').email, 'base64').toString('utf8'),
        password: cookies.get('user').password
      }).then(res => {
        if (res.status == 200) {
          dispatch(login({
            'id': res.data['id'],
            'tag': res.data['tag'],
            'email': res.data['email'],
            'firstName': res.data['firstName']
          }))
          dispatch(setMode({ isDark: res.data['isDark'] }))
          console.log('User logged in successfully')
        }
      }).catch(err => {
        console.log(err.message)
      })
    }
    dispatch(loading({ 'isLoading': false }))
  }, []);



  /* This `useEffect` hook is watching for changes in the `text` state variable. If the `text` variable
  is not an empty string, it sets a timeout to make an API call to search for users that match the
  text. Once the API call is complete, it sets the `founded` state variable to the results. If the
  `text` variable is an empty string, it sets the `founded` state variable to an empty array. The
  `useEffect` hook also returns a cleanup function that clears the timeout to prevent memory leaks. */
  useEffect(() => {
    if (text.trim() !== "") {
      const timeOutId = setTimeout(() => {
        axios.get("/api/usersNeeded/searching/" + text).then((res) => {
          setFounded(res.data)
        }).catch((err) => {
          console.log(err)
        })
      }, 500);
      return () => clearTimeout(timeOutId);
    } else {
      setFounded([])
    }
  }, [text])
  return (<nav className="flex items-center justify-between bg-main-color py-2 px-6 text-main-text-color border-b border-left-rigth-text-color">
    <Link to="/" className="item w-32">
      <img src="/images/logo.png" alt="Logo" className="h-10 w-10 rounded-full block" />
    </Link>
    {id !== 0 ? (
      <Link to={`/users/${tag}`} className="item w-32">
        About {firstName}
      </Link>
    ) : null}
    {!isLoading ? (
      <div className="item w-full flex items-center">
        <div className="item w-full text-center pr-5 relative flex items-center h-full">
          <input
            type="text"
            placeholder="Search..."
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            className="w-11/12 text-gray-900"
          />
          {founded.length > 0 ? (
            <div className="absolute h-fit top-0 overflow-y-auto max-w-3xl z-[10000] w-full bg-nav-popup-color max-h-96 pt-3 rounded-lg rounded-t-none pb-3 mx-3 left-1/2 transform -translate-x-1/2">
              {founded.map((thing) => {
                return <ProfPicName key={thing.type + "" + thing.id} data={thing} resetText={resetText} />;
              })}
            </div>
          ) : null}
          {alertsOpened && alerts.length > 0 ? (
            <div className="absolute h-fit top-0 overflow-y-auto max-w-3xl z-[10001] w-full bg-nav-popup-color max-h-96 pt-3 rounded-lg rounded-t-none pb-3 mx-3 left-1/2 transform -translate-x-1/2">
              {alerts.map((alert) => {
                return <AlertElement key={alert.id} data={alert} negalTheAlertOpened={negalTheAlertOpened} />;
              })}
            </div>
          ) : null}
        </div>
        {id > 0 ? (
          <div className="item flex">
            <AlertsOnNavBarIsUnreaded alertsUnSeen={alertsUnSeen} negalTheAlertOpened={negalTheAlertOpened} />
            <div className="relative item">
              <button
                className="flex items-center justify-center rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setIsOpen(!isOpen)}
              >
                <MenuTwoToneIcon />
              </button>
              {isOpen && (
                <div className="absolute z-10 right-0 mt-2 py-2 w-48 bg-nav-popup-color rounded-md rounded-t-none shadow-lg text-main-text-color">
                  <Link to="/" className="block px-4 py-2 text-sm" onClick={() => setIsOpen(false)}>
                    Home
                  </Link>
                  <Link
                    to="/users/settings"
                    className="block px-4 py-2 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link to="/messages" className="block px-4 py-2 text-sm" onClick={() => setIsOpen(false)}>
                    Messages
                  </Link>
                  <Logout setIsOpenFalse={setIsOpenFalse} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex">
            <Login setIsOpenFalse={setIsOpenFalse} />
            <div className="relative item">
              <button
                className="flex items-center justify-center rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setIsOpen(!isOpen)}
              >
                <MenuTwoToneIcon />
              </button>
              {isOpen && (
                <div className="absolute z-10 right-0 mt-1 py-2 w-48 bg-nav-popup-color text-main-text-color rounded-md rounded-t-none shadow-lg">
                  <Link
                    to="/welcome"
                    className="block px-4 py-2 text-sm "
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                  <Link
                    to="/forgottenpassword"
                    className="block px-4 py-2 text-sm "
                    onClick={() => setIsOpen(false)}
                  >
                    Forgotten Password
                  </Link>
                  <Link
                    to="/emailVerification"
                    className="block px-4 py-2 text-sm "
                    onClick={() => setIsOpen(false)}
                  >
                    Resend Verification
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    ) : null}
  </nav>
  )
}

export default NavBar
