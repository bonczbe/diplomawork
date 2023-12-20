import React from 'react'

function About({ user }) {
  return (
    <div className="item w-11/12 float-left h-full flex">
      <section className='float-left mr-3 item h-full w-2/6 flex flex-col break-words' style={{ whiteSpace: "pre-wrap" }}>
        <span>Description:</span> {(user.description) ? user.description : "-"}
      </section>
      <section className='float-left mr-3 item w-1/6 flex flex-col'>
        <span>Birthday:</span> {(user.canSeeBirthDate) ? user.birthDate : "unknown"}
      </section>
      <section className='float-left mr-3 item w-1/6 text-center flex flex-col'>
        <span>Status:</span> {(user.status) ? user.status : "unknown"}
      </section>
      <section className='float-left mr-3 item w-1/6 text-center flex flex-col'>
        <span>Gender:</span> {(user.gender) ? user.gender : "unknown"}
      </section>
      <section className='float-left mr-3 item w-1/6 text-center flex flex-col'>
        <span>Pronouns:</span> {(user.pronouns) ? user.pronouns : "unknown"}
      </section>
    </div>
  )
}

export default About
