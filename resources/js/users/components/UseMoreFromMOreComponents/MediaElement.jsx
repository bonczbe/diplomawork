import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../sass/popup.css'
import ReportButton from './ReportButton';

function MediaElement({ data, place }) {
  const [reportedByUser, setReportedByUser] = useState(false)
  const navigate = useNavigate();

  const setterReportedByUser = (fromcalled) => {
    setReportedByUser(fromcalled)
  }
  const source = (data) => {
    let tag = ""
    if (typeof data.imageURI !== "undefined") {
      tag = "imageURI"
    } else if (typeof data.profilePicURI !== "undefined") {
      tag = "profilePicURI"
    } else if (typeof data.WallPaperPicURI !== "undefined") {
      tag = "WallPaperPicURI"
    }
    if (tag !== "") return data[tag]
    else navigate('/404')
  }
  const isVideo = (data) => {
    let tag = ""
    if (typeof data.imageURI !== "undefined") {
      tag = "imageURI"
    } else if (typeof data.profilePicURI !== "undefined") {
      tag = "profilePicURI"
    } else if (typeof data.WallPaperPicURI !== "undefined") {
      tag = "WallPaperPicURI"
    }
    if (tag !== "") return data[tag].endsWith(".mp4") || data[tag].endsWith(".ogv") || data[tag].endsWith(".ogg")
    else navigate('/404')
  }
  return (
    <div className='py-2' key={source(data) + data.date}>
      <Popup
        trigger={<div className='w-full'>{
          (isVideo(data)) ?
            <video style={{ pointerEvents: "all" }} className={"mw-full object-contain item"} controls>
              <source src={source(data)} style={{ pointerEvents: "all" }} />
              Your browser does not support the video tag.
            </video> :
            <img style={{ pointerEvents: "all" }} alt="Post image" src={source(data)} className={"w-full object-contain item"} />
        }</div>}
        modal
      >
        {close => (
          <div className="modal">
            <button className="close" onClick={close}>
              &times;
            </button>
            <div className="content text-center">
              {(reportedByUser == false) ? <div className="py-2">
                <ReportButton fromWhere={((typeof data.imageURI !== "undefined") ? (place + "PostImage") : ((typeof data.profilePicURI !== "undefined") ? ("profilePic") : ("wallPaper")))} setterReportedByUser={setterReportedByUser} outsideID={data.id} />
                {
                  (isVideo(data)) ?
                    <video style={{ pointerEvents: "all" }} className={"mw-full object-contain item"} controls>/
                      <source src={source(data)} style={{ pointerEvents: "all" }} />
                      Your browser does not support the video tag.
                    </video> :
                    <img style={{ pointerEvents: "all" }} alt="Post image" src={source(data)} className={"w-full object-contain item"} />
                }
              </div> : null}
            </div>
          </div>
        )}
      </Popup>
    </div>
  )
}

export default MediaElement