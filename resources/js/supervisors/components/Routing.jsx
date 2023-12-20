import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import NotFound from './../../Errors/NotFound'
import Unauthorized from './../../Errors/Unauthorized'
import Permission from './../../Errors/Permission'
import { useSelector } from 'react-redux'
import Terms from './../../users/components/Terms'
import LoginCheck from './LoginCheck'
import LoggedInView from './LoggedInView'
import Profile from './Datas/Profile'
import NewPassword from './OutOfLogin/NewPassword'
import Owner from './Datas/Owner'
import Admins from './Datas/Admins'
import SetNewPasswd from './OutOfLogin/SetNewPasswd'
import EmailVerification from './OutOfLogin/VerifyEmail'

/**
 * This is a routing function in JavaScript React that renders different components based on the URL
 * path.
 * @returns A React component called "Routing" is being returned. It contains a div with a class name
 * "routing" and several Route components that define the different paths and corresponding components
 * to render when the path is accessed. The "additionalRoute" variable is used to prefix all the paths.
 * The "isLoading" variable is used to conditionally render the Routes component based on whether the
 * supervisor data is still loading or
 */
function Routing() {
  const additionalRoute = "/supervisors/panel"
  const isLoading = useSelector((state) => state.supervisor.isLoading);

  return (
    <div className='routing bg-secondary-color h-90 h-full max-h-screen flex-1 text-secondary-text-color'>
      {(!isLoading) ?
        <div id="kek" className='flex w-full h-full overflow-y-auto'>
        <Routes>
          <Route exact path={additionalRoute + "/"} element={<LoginCheck loggedin={<LoggedInView />} />} />
          <Route exact path={additionalRoute + "/main"} element={<LoginCheck loggedin={<Navigate to={additionalRoute + "/"} replace />} />} />
          <Route exact path={additionalRoute + "/profile"} element={<LoginCheck loggedin={<Profile />} />} />
          <Route exact path={additionalRoute + "/welcome"} element={<LoginCheck loggedin={<Navigate to={additionalRoute + "/"} replace />} />} />
          <Route exact path={additionalRoute + "/unauthorized"} element={<Unauthorized />} />
          <Route exact path={additionalRoute + "/owner"} element={<LoginCheck loggedin={<Owner />} />} />
          <Route exact path={additionalRoute + "/admins"} element={<LoginCheck loggedin={<Admins />} />} />
          <Route exact path={additionalRoute + "/newPasswd"} element={<NewPassword />} />
          <Route path={additionalRoute + "/forgottenpassword/:hash"} element={<SetNewPasswd />} />
          <Route path={additionalRoute + "/emailVerification/:hash"} element={<EmailVerification />} />
          <Route exact path={additionalRoute + "/permission"} element={<Permission />} />
          <Route exact path={additionalRoute + "/terms"} element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
        : null
      }
    </div>
  )
}

export default Routing
