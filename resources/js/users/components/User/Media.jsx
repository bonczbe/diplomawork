import React, { useState, useEffect } from 'react'
import axios from 'axios';
import MediaContent from '../UseMoreFromMOreComponents/MediaContent';

function Media({ id }) {
  const [contents, setContents] = useState([])
  const [choosed, setChoosed] = useState(1)

  useEffect(() => {
    setContents([]);
    switch (choosed) {
      case 1:
        axios.get('/api/usersNeeded/postimage/allByUser/' + id).then((response) => {
          setContents(response.data)
        }).catch(err => {
          console.log(err.message)
        })
        break;
      case 2:
        axios.get('/api/usersNeeded/wallpaper/all/user/' + id).then((response) => {
          setContents(response.data)
        }).catch(err => {
          console.log(err.message)
        })
        break;
      default:
        axios.get('/api/usersNeeded/profilepics/all/user/' + id).then((response) => {
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
          <MediaContent contents={contents} place={"normal"} />
          : "Empty for now"
        }
      </div>
    </div>
  )
}

export default Media
