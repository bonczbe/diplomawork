import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux'
import { login } from '../../Redux/userSlice'
import { setMode } from '../../Redux/settingsSlice'
import Cookies from 'universal-cookie';
import { useAlert } from 'react-alert';


function Login({ setIsOpenFalse }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const dispatch = useDispatch()
  var cookies = new Cookies();
  const alerts = useAlert()

  const logIn = (e) => {
    e.preventDefault();
    axios.post('/api/auth/user/login', {
      email: email,
      password: Buffer.from(password).toString('base64')
    }).then(response => {
      if (response.status == 200) {
        dispatch(login({
          'id': response.data['id'],
          'tag': response.data['tag'],
          'email': response.data['email'],
          'firstName': response.data['firstName']
        }))
        dispatch(setMode({ isDark: response.data['isDark'] }))
        console.log('User logged in successfully')
        const current = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(current.getFullYear() + 1);
        cookies.set('user', {
          'email': Buffer.from(email).toString('base64'),
          'password': Buffer.from(password).toString('base64')
        }, { path: '/', expires: nextYear });
        setIsOpenFalse()
      }
    }).catch(error => {
        alerts.error("Failed to log in!")
      console.log(error.message)
    })
  }
  return (
    <form onSubmit={logIn} className="w-full h-fit flex items-center">
      <input
        type="text"
        placeholder="Email"
        autoComplete="off"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className='mr-2 text-gray-900'
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className='mr-2 text-gray-900'
      />
      
      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 mx-2 my-1 py-1 rounded"
                    >
                        Login
                    </button>
    </form>
  )
}

export default Login
