import React, { useEffect, useState } from 'react'
import Histories from '../History/Histories'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../sass/popup.css'
import { useAlert } from 'react-alert'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Post from '../Posts/Post'
import AddAPhotoTwoToneIcon from '@mui/icons-material/AddAPhotoTwoTone';
import UploadedContent from '../Chats/UploadedContent'
import Loading from '../../../animation/Loading'

function MainData() {
  const alerts = useAlert()
  var loggedInID = useSelector((state) => state.user.id)
  const [newPosts, setNewPosts] = useState()
  const [newImages, setNewImages] = useState([])
  const [removedPost, setRemovedPost] = useState(0)
  const [posts, setPosts] = useState()
  const [messageFile, setMessageFile] = useState([]);
  const [messageFileImage, setMessageFileImage] = useState([]);
  const [uploadedHistory, setUploadedHistory] = useState([]);

  /**
   * This function creates a new post with optional images and adds it to the list of posts.
   */
  const newPost = (e) => {
    e.preventDefault()
    var isFile = (newImages.length > 0 && newImages.length < 11) ? true : false
    axios.post('/api/post/new', {
      userID: loggedInID,
      isFile: isFile,
      text: newPosts
    }).then(response => {
      if (isFile && response.data[0].id > 0) {
        for (let i = 0; i < newImages.length; i++) {
          let fd = new FormData()
          fd.append('image', newImages[i])
          fd.append('postID', response.data[0].id)
          axios.post('/api/postimage/new', fd, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }).then(() => {
            alerts.success("Post File Added")
          }).catch(err => {
            alerts.error(err.message)
            console.log(err.message)
          })
        }
        setNewImages([])
      }
      let helpresponse = response.data[0]
      helpresponse = {
        ...helpresponse,
        place: "normalPost"
      }
      let datas = [helpresponse, ...posts]
      setPosts(datas)
      setNewPosts("")
      if (!isFile) alerts.success("Post Added")
    }).catch(error => {
      alerts.error(error.message)
      console.log(error.message)
    })
  }

  /* This `useEffect` hook is making an API call to retrieve all posts from the server and then sorting
  them by date in descending order. The retrieved posts are then stored in the `posts` state
  variable using the `setPosts` function. The `useEffect` hook is triggered whenever the
  `loggedInID` state variable changes. */
  useEffect(() => {
    axios.get('/api/allPosts/all/' + loggedInID).then(async (res) => {
      let helper = Object.values(res.data);
      helper = await helper.sort((a, b) => {
        let aa = Date.parse(a.date)
        let bb = Date.parse(b.date)
        return (bb - aa)
      });
      setPosts(helper);
    }).catch((error) => {
      console.log(error)
    })
  }, [loggedInID])

  /**
   * The function "refresh" sets the removed post data.
   */
  const refresh = (postData) => {
    setRemovedPost(postData)
  }
  /* This `useEffect` hook is triggered whenever the `removedPost` state variable changes. It filters
  the `posts` state variable to remove the post that matches the `removedPost` data (based on the
  `id` and `place` properties). The filtered posts are then stored in the `posts` state variable
  using the `setPosts` function. */
  useEffect(() => {
    if (posts) {
      const newPosts = posts.filter((post) => {
        if (removedPost.place == post.place) {
          return post.id != removedPost.id
        }
        return true
      })
      setPosts(newPosts)
    }
  }, [removedPost])

  /**
   * This function uploads selected image files to the server and displays success or error alerts
   * based on the upload status.
   */
  const newHistory = (e) => {
    e.preventDefault();
    let allUploaded = true;
    if (messageFile.length > 0) {
      for (let i = 0; i < messageFile.length; i++) {
        let fd = new FormData()
        fd.append('fileImage', messageFile[i])
        fd.append('who', loggedInID)
        axios.post('/api/history/new', fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }).then((res) => {
          setUploadedHistory(res.data)
        }).catch(err => {
          allUploaded = false;
          console.log(err.message)
        })
      }
      if (allUploaded) {
        alerts.success("Image(s) uploaded")
      } else {
        alerts.error("One or more image(s) weren't uploaded")
      }
      setMessageFile([])
    } else {
      alerts.info("You need to select images first!")
    }
  }



  /* This `useEffect` hook is triggered whenever the `messageFile` state variable changes. It creates
  an array of objects containing the URL and the image file for each file in the `messageFile` array
  using the `URL.createObjectURL()` method. It then sets the `setMessageFileImage` state variable to
  the new array of objects. If the `messageFile` array is empty, it sets the `setMessageFileImage`
  state variable to an empty array. */
  useEffect(() => {
    if (messageFile.length < 1) {
      setMessageFileImage([]);
    }
    const newImageUrls = [];
    messageFile.forEach((image) => newImageUrls.push({ url: URL.createObjectURL(image), image: image }));
    setMessageFileImage(newImageUrls);
  }, [messageFile])

  /**
   * This function removes an item from a list of messages.
   */
  const RemoveFromList = (item) => {
    let helper = messageFile.filter((image) => {
      return image.name != item.image.name
    })
    setMessageFile(helper)
  }
  return (loggedInID > 0) ? (
    <div className='item w-full'>
      <div className='w-full overflow-x-auto h-fit flex flex-row relative scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-300' style={{WebkitOverflowScrolling: 'touch'}}>
        <div className=' float-left mx-3  h-28 w-16'>
          <Popup
            trigger={<div className='w-full text-center'><button className="button border-2 border-neutral-800 h-20 w-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 justify-center items-center flex"> <div className='bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-neutral-800 rounded-lg p-2'><AddAPhotoTwoToneIcon /></div>  </button></div>}
            modal
          >
            {close => (
              <div className="modal">
                <button className="close" onClick={close}>
                  &times;
                </button>
                <div className="header"> Add new Histories </div>
                <div className="content text-center">
                  <form onSubmit={newHistory} className="w-full">

                    <div className='relative h-20'>
                      <div className="absolute bottom-0 z-[99] left-0 right-0 overflow-x-scroll mx-3 flex flex-row h-20">
                        {messageFileImage.map((item) => {
                          return <UploadedContent item={item} key={item.url} RemoveFromList={RemoveFromList} isHistories={true} />
                        })}
                        &nbsp;
                      </div>

                    </div>
                    <section className='w-full'>
                      <input type="file"
                        accept="image/*, video/mp4, video/ogv, video/ogg, video/webm"
                        multiple value={newImages.pagetwodata} onChange={(e) => setMessageFile(Array.prototype.slice.call(e.target.files))} className="block mb-5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                    </section>
                    <button type="submit" className='w-fit'>Upload New Images</button>
                  </form>
                </div>
              </div>
            )}
          </Popup>
        </div>
        <Histories fromCalled={"main"} uploadedHistory={uploadedHistory} />
      </div>
      <div className='w-full'>
        <Popup
          trigger={<div className='w-full text-center'>Do you want to share any new about yourself? <button className="button"> Click here! </button></div>}
          modal
        >
          {close => (
            <div className="modal">
              <button className="close" onClick={close}>
                &times;
              </button>
              <div className="header"> Add new Post </div>
              <div className="content text-center">
                <form onSubmit={newPost}>
                  <section className='w-full'>
                    <textarea rows="15" placeholder="Description" autoComplete="off" maxLength="3000" value={newPosts} onChange={(e) => setNewPosts(e.target.value)} className="w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  </section>
                  <section className='w-full'>
                    <input type="file"
                      accept="image/*, video/mp4, video/ogv, video/ogg, video/webm"
                      multiple value={newImages.pagetwodata} onChange={(e) => setNewImages(Array.prototype.slice.call(e.target.files))} className="block mb-5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                  </section>
                  <button type="submit" className='w-fit'>Upload New Post</button>
                </form>
              </div>
            </div>
          )}
        </Popup>
      </div>
      <div className='w-full'>
        {
            (posts==undefined)?
            <div>
                <h1 className="w-full text-2xl text-center pt-8">Loading...</h1>
                <Loading />
            </div>
            :(posts.length>0)?posts.map(post => {
                return <Post key={post.id + "" + post.place} postdata={post} id={(post.place == "normalPost") ? post.userID : ((post.place == "pagePost") ? post.who : ((post.place == "groupPost") ? post.who : null))} place={post.place} functionRemove={refresh} />
            }):<div className='w-full text-xl text-center pt-8'>
                There is no posts from you or what you can see, follow pages, <br />
                join groups and meet with people on the site!
            </div>
        }
      </div>
    </div>
  ) : null
}

export default MainData
