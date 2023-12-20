import React, { useState } from 'react'
import UsersOwnHistories from '../History/UsersOwnHistories';
import BlockedUsers from './BlockedUsers';
import Update from './Update'

function Edit() {
  const [view, setView] = useState(0)
  const renderViewFlow = (param) => {
    switch (param) {
      case 1:
        return <BlockedUsers />;
      case 2:
        return <UsersOwnHistories />;
      default:
        return <Update />;
    }
  }
  return (
    <div>
      <section className='flex justify-between w-full my-4'>
        <button onClick={() => { setView(0) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Update Profile</button>
        <button onClick={() => { setView(1) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Blocked Users</button>
        <button onClick={() => { setView(2) }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Collections of Histories</button>
      </section>
      {renderViewFlow(view)}
    </div>
  )
}

export default Edit
