import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import Welcome from './OutOfLogin/Welcome';

function LoginCheck(props) {
  const id = useSelector((state) => state.supervisor.id);
  const role = useSelector((state) => state.supervisor.role);
  const navigate = useNavigate();
  useEffect(() => {
    if (id < 1) {
      navigate('/supervisors/panel/welcome')
    }
  }, [id])
  return (
    <div className='w-full h-full'>
      {(id != 0 && role < 3 && role > 0) ? props.loggedin : <Welcome />}
    </div>
  )
}

export default LoginCheck
