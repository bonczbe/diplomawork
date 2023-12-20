import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useAlert } from "react-alert";

function LeftData() {
  const id = useSelector((state) => state.user.id);
  const tag = useSelector((state) => state.user.tag);
  const [user, setUser] = useState("");
  const [profPic, setProfPric] = useState("");
  const [emoteTag, setEmoteTag] = useState("");
  const [emoteFile, setEmoteFile] = useState([]);
  const [loading, setLoading] = useState(true);
  const alerts = useAlert()


  /* This is a React hook called `useEffect` that is used to perform side effects in functional
  components. In this case, it is fetching data from an API endpoint using Axios and updating the
  state variables `user`, `profPic`, and `loading` based on the response. The `[]` as the second
  argument to `useEffect` means that this effect will only run once when the component mounts. The
  `if (id > 0)` condition is used to ensure that the API call is only made if the `id` variable is
  greater than 0. */
  useEffect(() => {
    if (id > 0)
      axios.get('/api/users/' + id).then((response) => {
        setUser(response.data)
        axios.get('/api/profilepics/' + response.data.actualProfilePicID + '/' + id).then((res) => {
          setProfPric(res.data.profilePicURI);
          setLoading(false)
        }).catch((err) => {
          console.log(err)
        })
      }).catch((error) => {
        console.log(error);
      })

  }, [id])

  /**
   * This function uploads a user's personal emote to a server using axios.
   */
  const uploadEmote = (e) => {
    e.preventDefault();
    let helper = emoteTag.replace(' ', '').replace("#", "")
    if (id > 0 && helper.length > 0) {
      let fd = new FormData()
      fd.append('user', id)
      fd.append('image', emoteFile)
      fd.append('name', helper)
      axios.post('/api/personalemote/new', fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then(res => {
        alerts.success(helper + " Added!")
      }).catch(error => {
        console.log(error.message)
      })
      setEmoteFile([])
      setEmoteTag("")
    }
  }

  return (
    <div className="item w-1/12 bottom-0 pt-3 sticky top-0  text-center bg-left-rigth-color border-r border-left-rigth-text-color">
      {id > 0 && !loading ? (
        <div className="w-full">
          <div className="w-full">
            <Link to={"/users/" + tag} className="Profile Picture">
              <img src={profPic} alt="Profile Picture" style={{
                height: 50, width: 50, borderRadius: 5
              }} className="float-left" />
              <div style={{ height: 50, lineHeight: "50px" }} className=' truncate block'>{user.name.split(' ')[0]}</div>
            </Link>
          </div>
          <div className="w-full">
            <Link to="users/settings" className="">
              Settings
            </Link>
          </div>
          <div className="w-full">
            <Link to={"/users/pages/" + tag} className="">
              Pages
            </Link>
          </div>
          <div className="w-full">
            <Link to={"/users/groups/" + tag} className="">
              Groups
            </Link>
          </div>
          <div className="w-full">
            <Link to={"/users/events/" + tag} className="">
              Events
            </Link>
          </div>
          <div className="w-full">
            <Link to={"/pages/new"} className="">
              New Page
            </Link>
          </div>
          <div className="w-full">
            <Link to={"/groups/new"} className="">
              New Group
            </Link>
          </div>
          <div className="w-full">
            <Link to={"/events/new"} className="">
              New Event
            </Link>
          </div>
          <form onSubmit={uploadEmote} className='flex flex-col pt-3'>
            <span className="w-full">Upload New Emote</span>
            <input
              type="text"
              placeholder="Tag"
              maxLength="30"
              className="w-3/4 text-gray-900"
              value={emoteTag}
              onChange={(e) => setEmoteTag(e.target.value.replace(' ', ''))}
              required
            />
            <input
              type="file"
              className=' text-gray-900'
              accept="image/*, video/mp4, video/ogv, video/ogg, video/webm"
              onChange={(e) => {
                setEmoteFile(e.target.files[0])
              }
              }
              required
            />
            <button type="submit" className="w-fit">Upload</button>
          </form>



        </div>
      ) : null}
    </div>
  );
}

export default LeftData;
