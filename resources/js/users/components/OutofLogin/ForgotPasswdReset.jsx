import { Tooltip } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { useAlert } from 'react-alert';

function ForgotPasswdReset() {
  const loggedInID = useSelector((state) => state.user.id);
  const navigate = useNavigate()
  let { hash } = useParams();
  const [userEmail, setUserEmail] = useState("")
  const [passwd, setPasswd] = useState("")
  const [rePasswd, setRePasswd] = useState("")
  const alerts = useAlert()
  useEffect(() => {
    if (loggedInID > 0) {
      navigate("/home")
    }
  }, [loggedInID])
  const resettingPassws = (e) => {
    e.preventDefault()
    if (loggedInID < 1 && passwd == rePasswd) {
      alerts.info("Email is generating!")
      axios.post('/api/auth/user/newPassword', {
        email: userEmail,
        passwd: Buffer.from(passwd).toString('base64'),
        passwd2: Buffer.from(rePasswd).toString('base64'),
        hash: hash
      }).then(() => {
        alerts.success("Password resetted!")
        setUserEmail("")
        setPasswd("")
        setRePasswd("")
      }).catch(() => {
        alerts.error("Something went wrong!")
      })
    } else {
      alerts.error("Your password does not match with the requirements")
    }
  }
  return (
    <div className="w-full h-full flex justify-center items-center">
      <form onSubmit={resettingPassws} className=" p-6 rounded-lg shadow-md">
                <h1 className="text-center mb-4 text-2xl font-bold">
                    Set you new password
                </h1>
        <label htmlFor="email" className="block mb-2  font-medium">Email:</label>
        <input
          type="email"
          value={userEmail}
          onChange={(e) => { setUserEmail(e.target.value.trim()) }}
          name="email"
          id="email"
          required
          className="block w-full py-2 px-3 border text-gray-900 rounded-lg shadow-sm  focus:outline-none focus:ring-2 focus:ring-secondary-color focus:border-transparent"
        />
        <label htmlFor="passwd" className="block mt-4 mb-2  font-medium">Password:</label>
        
        <div className='w-full flex'>
        <div className='w-11/12'>
        <input
          type="password"
          value={passwd}
          onChange={(e) => { setPasswd(e.target.value) }}
          name="passwd"
          id="passwd"
          required
          className="block w-full py-2 px-3 border rounded-lg text-gray-900 shadow-sm  focus:outline-none focus:ring-2 focus:ring-secondary-color focus:border-transparent"
        />
        </div>
        <div className='w-1/12 h-fit justify-center flex items-center'>
        <Tooltip title="Password needed: Capital letter, small letter, number and special character and need to be 8 characters atleast.">
          <InfoTwoToneIcon />
        </Tooltip>
        </div>
        </div>
        <label htmlFor="agpasswd" className="block mt-4 mb-2  font-medium">Password again:</label>
        <input
          type="password"
          value={rePasswd}
          onChange={(e) => { setRePasswd(e.target.value) }}
          name="agpasswd"
          id="agpasswd"
          required
          className="block w-full py-2 px-3 border rounded-lg text-gray-900 shadow-sm  focus:outline-none focus:ring-2 focus:ring-secondary-color focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-secondary-text-color text-secondary-color py-2 px-4 mt-4 rounded-md font-medium hover:bg-opacity-80 transition-all duration-200"
        >
          Submit
        </button>
      </form>
    </div>

  )
}

export default ForgotPasswdReset
