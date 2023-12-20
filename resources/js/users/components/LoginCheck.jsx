import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import Welcome from './OutofLogin/Welcome';

function LoginCheck(props) {
  const id = useSelector((state) => state.user.id);
  const navigate = useNavigate();
  useEffect(() => {
    if (id < 1) {
      navigate('/welcome')
    }
  }, [id])
  return (
    <div className='w-full h-full'>
      {(id != 0) ? props.loggedin : <Welcome />}
    </div>
  )
}

export default LoginCheck
