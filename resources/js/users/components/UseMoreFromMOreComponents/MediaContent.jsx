import React from 'react'
import MediaElement from './MediaElement';

function MediaContent({ contents, place }) {

  return (
    <div className='w-full h-full' style={{
      WebkitColumnCount: 3, MozColumnCount: 3, columnCount: 3,
      WebkitColumnWidth: "33%", MozColumnWidth: "33%", columnWidth: "33%"
    }}>
      {contents.map((data) => {
        return <MediaElement data={data} key={data.imageURI} place={place} />
      })}
    </div>
  )
}

export default MediaContent
