import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const id = useSelector((state) => state.supervisor.id);
  const navigate = useNavigate()
 /* `useEffect` is a hook in React that allows you to perform side effects in function components. In
 this case, the `useEffect` hook is being used to redirect the user to the main panel page if the
 `id` of the supervisor is greater than 0. The `useSelector` hook is used to get the `id` value from
 the Redux store, and the `useNavigate` hook is used to navigate to the desired page. The `[id]`
 dependency array ensures that the effect is only triggered when the `id` value changes. */
  useEffect(() => {
    if (id > 0) {
      navigate('/supervisors/panel/main')
    }
  }, [id])
  return (
    <div className="flex flex-col justify-center items-center w-full h-full bg-transparent">
      <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">
        Welcome to the admin side of the page!
      </h1>
      <p className="text-lg mb-8 text-center">
        We're excited to have you here. This is where you can manage the reports, and keep track of your site data and analytics.
      </p>
      <p className="text-lg font-bold mb-2">
        Please log in to your account on the right side of the navbar!
      </p>
    </div>
  )
}

export default Welcome
