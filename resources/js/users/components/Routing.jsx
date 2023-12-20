import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Messages from './Chats/BigScreen/Messages'
import Group from './EventPageGroup/Group/Group'
import Event from './EventPageGroup/Event/Event'
import NotFound from '../../Errors/NotFound'
import User from './User/User'
import Page from './EventPageGroup/Page/Page'
import { New } from './EventPageGroup/New'
import { Navigate } from "react-router-dom";
import Unauthorized from '../../Errors/Unauthorized'
import Permission from '../../Errors/Permission'
import { useSelector } from 'react-redux'
import LoginCheck from './LoginCheck'
import LoggedInView from './LoggedInView'
import LeftData from './Datas/LeftData'
import RightData from './Datas/RightData'
import Pages from './User/Pages'
import Groups from './User/Groups'
import Events from './User/Events'
import Terms from './Terms'
import FromLink from './Posts/FromLink'
import EditPageMenu from './EventPageGroup/Page/EditPageMenu'
import EditEventMenu from './EventPageGroup/Event/EditEventMenu'
import EditGroupMenu from './EventPageGroup/Group/EditGroupMenu'
import Edit from './User/Edit'
import ForgotPasswd from './OutofLogin/ForgotPasswd'
import EmailVerification from './OutofLogin/EmailVerification'
import RegenerateEmailVer from './OutofLogin/RegenerateEmailVer'
import ForgotPasswdReset from './OutofLogin/ForgotPasswdReset'

function Routing() {
  const isLoading = useSelector((state) => state.user.isLoading);
  const loggedInID = useSelector((state) => state.user.id);
  const [chats, setChats] = useState([])
  const [actual, setActual] = useState({ id: 0, type: "none" })
  const [fromRight, setFromRight] = useState(false)
  const [loadingFromRight, setLoadingFromRight] = useState(true)

  const updateLoading = () => {
    setLoadingFromRight(!loadingFromRight)
  }
  const blockedUser = (item) => {
    let helper = chats.filter((chat) => {
      return chat.channel != item.channel
    })
    if (helper.length > 1) {
      setActual(helper[1])
    } else {
      setActual({ id: 0, type: "none" })
    }
    setChats(helper)
  }
  const settingChats = (arrays) => {
    setChats(arrays)
  }
  const setterActual = (arrays, fromRightData) => {
    if (typeof actual.channel != "undefined") {
      actual.channel.stopListening('.newMessage').stopListening('.newImage')
        .stopListening('.removeImage').stopListening('.removeMember')
        .stopListening('.newMember').stopListening('.newRole').stopListening('.destroyMessage')
        .stopListening('.updateMessage').stopListening('.seenMessage').stopListeningForWhisper('typing')
    }
    if (fromRightData != undefined) {
      setFromRight(true)
    } else {
      setFromRight(false)
    }
    setActual(arrays)
  }
  return (
    <div className='routing bg-secondary-color h-90 h-full max-h-screen flex-1 text-secondary-text-color'>
      {(!isLoading) ?
        <div id="kek" className='flex w-full h-full overflow-y-auto'>
          {
            (loggedInID > 0) ? <LeftData key={loggedInID + "left"} /> : null
          }
          <div className={(loggedInID < 1) ? "item w-full" : 'item w-9/12'} style={{ paddingLeft: 15, paddingRight: 15 }}>
            <Routes>
              <Route exact path="/" element={<LoginCheck loggedin={<LoggedInView />} />} />
              <Route exact path="/home" element={<Navigate to="/" replace />} />
              <Route exact path="/register" element={<Navigate to="/welcome" replace />} />
              <Route exact path="/forgottenpassword" element={<ForgotPasswd />} />
              <Route exact path="/forgottenpassword/:hash" element={<ForgotPasswdReset />} />
              <Route path="/emailVerification/:hash" element={<EmailVerification />} />
              <Route exact path="/emailVerification" element={<RegenerateEmailVer />} />
              <Route exact path="/welcome" element={<LoginCheck loggedin={<LoggedInView />} />} />
              <Route path="/users/:tag" element={<User />} />
              <Route exact path="/users/settings" element={<LoginCheck loggedin={<Edit />} />} />
              <Route path="/users/pages/:tag" element={<Pages />} />
              <Route path="/users/groups/:tag" element={<Groups />} />
              <Route path="/users/events/:tag" element={<Events />} />
              <Route path="/post/:place/:id" element={<FromLink />} />
              <Route path="/events/:name/:eventId" element={<Event />} />
              <Route exact path="/events/new" element={<LoginCheck loggedin={<New type={"Event"} />} />} />
              <Route path="/events/settings/:name/:eventId" element={<LoginCheck loggedin={<EditEventMenu />} />} />
              <Route path="/pages/:name/:pageID" element={<Page />} />
              <Route exact path="/pages/new" element={<LoginCheck loggedin={<New type={"Page"} />} />} />
              <Route path="/pages/settings/:name/:pageID" element={<LoginCheck loggedin={<EditPageMenu />} />} />
              <Route path="/groups/:name/:groupId" element={<Group />} />
              <Route path="/groups/new" element={<LoginCheck loggedin={<New type={"Group"} />} />} />
              <Route path="/groups/settings/:name/:groupID" element={<LoginCheck loggedin={<EditGroupMenu />} />} />
              <Route path="/messages" element={<LoginCheck loggedin={<Messages chats={chats} updateLoading={updateLoading} loadingFromRight={loadingFromRight} actual={actual} setterActual={setterActual} blockedUser={blockedUser} fromRightData={fromRight} />} />} />
              <Route path="/login" element={<Navigate to="/welcome" replace />} />
              <Route exact path="/unauthorized" element={<Unauthorized />} />
              <Route exact path="/permission" element={<Permission />} />
              <Route exact path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          {
            (loggedInID > 0) ? <RightData key={loggedInID + "rigth"} settingChats={settingChats} setterActual={setterActual} /> : null
          }
        </div>
        : null}
    </div>
  )
}

export default Routing
