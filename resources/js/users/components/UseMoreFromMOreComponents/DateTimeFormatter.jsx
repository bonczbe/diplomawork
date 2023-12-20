import React from 'react'

function DateTimeFormatter({ sentDate }) {
  const date = new Date(sentDate)
  return (
    <span>{
      date.getFullYear()}-{String(date.getMonth() + 1).padStart(2, '0')}-{String(date
        .getDate()).padStart(2, '0')} {String(date.getHours()).padStart(2, '0')}:{String(date.getMinutes()).padStart(2, '0')
      }
    </span>
  )
}

export default DateTimeFormatter