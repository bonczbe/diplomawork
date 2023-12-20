import React from 'react'

/* This is a functional component in JavaScript React that takes in a prop called `postData` and
renders an image or video based on the file extension of the `imageURI` property of the `postData`
object. If the file extension is `.mp4`, `.ogv`, or `.ogg`, it renders a video element with the
`source` pointing to the `imageURI` and a fallback message if the browser does not support the video
tag. If the file extension is anything else, it renders an image element with the `src` pointing to
the `imageURI`. The `className` and `style` properties are used to apply CSS styles to the elements. */
function ReportedImageRenderer({ postData }) {
    return (
        <div className="w-full h-full">
            {
                (postData.imageURI.endsWith(".mp4") || postData.imageURI.endsWith(".ogv") || postData.imageURI.endsWith(".ogg")) ?
                    <div>
                        <video style={{ pointerEvents: "all" }} className={(bigger) ? "max-h-96 object-contain" : "max-h-64 object-contain"} controls>
                            <source src={postData.imageURI} style={{ pointerEvents: "all" }} />
                            Your browser does not support the video tag.
                        </video>
                    </div> :
                    <div>
                        <img style={{ pointerEvents: "all" }} alt="Post image" src={postData.imageURI} className={"max-h-64 object-contain"} />
                    </div>
            }
        </div>
    )
}

export default ReportedImageRenderer