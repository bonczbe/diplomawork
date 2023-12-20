import React, { useState, useEffect } from 'react'
import axios from 'axios';
import MediaContent from '../../UseMoreFromMOreComponents/MediaContent';

function Media({ groupID }) {
  const [contents, setContents] = useState([])
  const [choosed, setChoosed] = useState(1)

 /* `useEffect` is a hook in React that allows you to perform side effects in function components. In
 this code, `useEffect` is used to fetch data from different API endpoints based on the value of the
 `choosed` state variable. Whenever `choosed` changes, the effect is triggered and the corresponding
 API call is made to fetch the data. The fetched data is then stored in the `contents` state
 variable using the `setContents` function. The `[]` passed as the second argument to `useEffect`
 ensures that the effect is only triggered when the component mounts and when `choosed` changes. */
  useEffect(() => {
    setContents([]);
    switch (choosed) {
      case 1:
        axios.get('/api/grouppostimage/allByGroup/' + groupID).then((response) => {
          setContents(response.data)
        }).catch(err => {
          console.log(err.message)
        })
        break;
      case 2:
        axios.get('/api/usersNeeded/wallpaper/all/group/' + groupID).then((response) => {
          setContents(response.data)
        }).catch(err => {
          console.log(err.message)
        })
        break;
      default:
        axios.get('/api/usersNeeded/profilepics/all/group/' + groupID).then((response) => {
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
          <MediaContent contents={contents} place={"group"} />
          : "Empty for now"
        }
      </div>
    </div>
  )
}

export default Media
