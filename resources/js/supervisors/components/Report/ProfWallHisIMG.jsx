import React from 'react'
/* This is a functional component in JavaScript React that takes in two props, `typeURITag` and
`postData`. It returns a div element that contains either a video or an image element based on the
value of `typeURITag` and the file extension of the `postData` URL. If `typeURITag` is "history" and
the file extension is ".mp4", ".ogv", or ".ogg", then a video element is returned with the `src`
attribute set to the `postData` URL. Otherwise, an image element is returned with the `src`
attribute set to the `postData` URL. The `style` attribute is used to set the `pointerEvents`
property to "all" for both the video and image elements. */

function ProfWallHisIMG({ typeURITag, postData }) {
  return (
    <div className="w-full h-full">
      {
        ((typeURITag == "history") && (postData[typeURITag].endsWith(".mp4") || postData[typeURITag].endsWith(".ogv") || postData[typeURITag].endsWith(".ogg"))) ?
          <video style={{ pointerEvents: "all" }} controls>
            <source src={postData[typeURITag]} style={{ pointerEvents: "all" }} />
            Your browser does not support the video tag.
          </video> :
          <img style={{ pointerEvents: "all" }} alt="Post image" src={postData[typeURITag]} />
      }
    </div>
  )
}

export default ProfWallHisIMG