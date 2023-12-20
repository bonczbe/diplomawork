import React, { useState, useEffect } from 'react'
import axios from 'axios';
import MediaContent from '../../UseMoreFromMOreComponents/MediaContent';

function Media({ pageID }) {
  const [contents, setContents] = useState([])
  const [choosed, setChoosed] = useState(1)

 /* The `useEffect` hook is used to perform side effects in a functional component. In this case, it is
 used to fetch data from an API based on the value of the `choosed` state variable. The `useEffect`
 hook takes two arguments: a function that performs the side effect, and an array of dependencies
 that determine when the effect should be re-run. In this case, the effect will be re-run whenever
 the `choosed` state variable changes. The function inside the `useEffect` hook sets the `contents`
 state variable to an empty array, and then makes an API call based on the value of `choosed`.
 Depending on the value of `choosed`, it will call a different API endpoint to fetch data and update
 the `contents` state variable with the response data. If there is an error, it will log the error
 message to the console. */
  useEffect(() => {
    setContents([]);
    switch (choosed) {
      case 1:
        axios.get('/api/usersNeeded/pageImages/allByPage/' + pageID).then((response) => {
          setContents(response.data)
        }).catch(err => {
          console.log(err.message)
        })
        break;
      case 2:
        axios.get('/api/usersNeeded/wallpaper/all/page/' + pageID).then((response) => {
          setContents(response.data)
        }).catch(err => {
          console.log(err.message)
        })
        break;
      default:
        axios.get('/api/usersNeeded/profilepics/all/page/' + pageID).then((response) => {
          setContents(response.data)
        }).catch(err => {
          console.log(err.message)
        })
        break;
    }

  }, [choosed])

  return (
    <div className='w-full h-full px-3'>
      <div className='w-full flex text-center h-fit py-2'>
        <div className='flex-1'>
          <button onClick={() => { setChoosed(0) }}>Profile Pictures</button>
        </div>
        <div className='flex-1'>
          <button onClick={() => { setChoosed(2) }}>Wallpapers Pictures</button>
        </div>
        <div className='flex-1'>
          <button onClick={() => { setChoosed(1) }}>Posts Pictures</button>
        </div>
      </div>
      <div className='w-full text-center' style={{ fontSize: "x-large" }}>
        {(contents.length > 0) ?
          <MediaContent contents={contents} place={"page"} />
          : "Empty for now"
        }
      </div>
    </div>
  )
}

export default Media
