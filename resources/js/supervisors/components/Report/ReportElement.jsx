import React, { useState, useEffect } from 'react'
import Post from '../../../users/components/Posts/Post';
import Comment from '../../../users/components/Posts/Comment';
import Reply from '../../../users/components/Posts/Reply';
import { useAlert } from 'react-alert';
import ReportedImageRenderer from './ReportedImageRenderer';
import ProfWallHisIMG from './ProfWallHisIMG';

function ReportElement({ data }) {
  const [needToRender, setNeedToRender] = useState("Loading...")
  const alerts = useAlert()
  /* `const renderer` is a function that is responsible for rendering the appropriate component based
  on the `data` prop passed to the `ReportElement` component. It uses `axios` to make API calls to
  retrieve data and then sets the state of `needToRender` to the appropriate component based on the
  `data.type` value. The function is declared as `async` because it uses `await` to wait for the API
  calls to complete before setting the state. */
  const renderer = async () => {
    if (data.type == "normalPost" || data.type == "groupPost" || data.type == "pagePost") {
      let postData = "deaultData"
      await axios.get('/api/supervisors/reports/posts/' + data.type + '/' + data.outsideID).then((res) => {
        postData = res.data
        if (postData != "deaultData") {
          setNeedToRender(<Post key={postData.outsideID} postdata={postData} id={postData.outsideID} place={data.type} fromAdmin={true} />)
        }
      }).catch(err => {
        console.log(err)
      })
    } else if (data.type == "normalComment" || data.type == "pageComment" || data.type == "groupComment") {
      let postData = "deaultData"
      await axios.get('/api/supervisors/reports/comments/' + data.type + '/' + data.outsideID).then((res) => {
        postData = res.data
        if (postData != "deaultData") {
          setNeedToRender(<Comment key={postData.outsideID} data={postData} place={data.type} fromAdmin={true} />)
        }
      }).catch(err => {
        console.log(err)
      })
    } else if (data.type == "normalReply" || data.type == "pageReply" || data.type == "groupReply") {
      let postData = "deaultData"
      await axios.get('/api/supervisors/reports/replies/' + data.type + '/' + data.outsideID).then((res) => {
        postData = res.data
        if (postData != "deaultData") {
          setNeedToRender(<Reply key={postData.outsideID} data={postData} place={data.type} fromAdmin={true} />)
        }
      }).catch(err => {
        console.log(err)
      })
    } else if (data.type == "profilePic") {
      let postData = "deaultData"
      await axios.get('/api/supervisors/reports/images/profilePic/' + data.outsideID + '/' + Math.floor(Math.random() * 50000)).then((res) => {
        postData = res.data
        if (postData != "deaultData") {
          setNeedToRender(<ProfWallHisIMG key={postData.id} postData={postData} typeURITag={"profilePicURI"} />)
        }
      }).catch(err => {
        console.log(err)
      })
    } else if (data.type == "wallPaper") {
      let postData = "deaultData"
      await axios.get('/api/supervisors/reports/images/wallPaper/' + data.outsideID + '/' + Math.floor(Math.random() * 50000)).then((res) => {
        postData = res.data
        if (postData != "deaultData") {
          setNeedToRender(<ProfWallHisIMG key={postData.id} postData={postData} typeURITag={"WallPaperPicURI"} />)
        }
      }).catch(err => {
        console.log(err)
      })
    } else if (data.type == "history") {
      let postData = "deaultData"
      await axios.get('/api/supervisors/reports/images/history/' + data.outsideID).then((res) => {
        postData = res.data
        if (postData != "deaultData") {
          setNeedToRender(<ProfWallHisIMG key={postData.id} postData={postData} typeURITag={"URI"} />)
        }
      }).catch(err => {
        console.log(err)
      })
    } else if (data.type == "PostImage" || data.type == "normalPostImage" || data.type == "pagePostImage" || data.type == "groupPostImage") {
      let postData = "deaultData"
      await axios.get('/api/supervisors/reports/images/postImages/' + data.type + '/' + data.outsideID).then((res) => {
        postData = res.data
        if (postData != "deaultData") {
          setNeedToRender(<ReportedImageRenderer key={postData.id} postData={postData} />)
        }
      }).catch(err => {
        console.log(err)
      })
    } else {
      alerts.info("I'm a trash man, Delete me!")
      setNeedToRender(<div className="flex justify-center items-center w-full h-full">
        <h1 className="text-4xl font-bold text-center text-blue-500">
          I'm a trash man, Delete me!
        </h1>
      </div>)
    }
  }
/* `useEffect` is a hook in React that allows you to perform side effects in function components. In
this case, it is used to call the `renderer` function when the component mounts (i.e., when it is
first rendered). The second argument `[]` is an empty array, which means that the effect will only
be executed once, when the component mounts. This is equivalent to the `componentDidMount` lifecycle
method in class components. */

  useEffect(() => {
    renderer()
  }, [])

  return (
    <div className='w-full h-full border border-black p-5'>
      {needToRender}
    </div>
  )
}

export default ReportElement
