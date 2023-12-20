import React, { useState } from 'react'
import { useAlert } from "react-alert"
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


export function New({ type }) {
  const alerts = useAlert()
  const id = useSelector((state) => state.user.id);
  var now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [place, setPlace] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [status, setStatus] = useState(false)
  const [businessHours, setBusinessHours] = useState([
    {
      "Monday": {
        "Open": "00:00",
        "Close": "00:00"
      }
    },
    {
      "Tuesday": {
        "Open": "00:00",
        "Close": "00:00"
      }
    },
    {
      "Wednesday": {
        "Open": "00:00",
        "Close": "00:00"
      }
    },
    {
      "Thursday": {
        "Open": "00:00",
        "Close": "00:00"
      }
    },
    {
      "Friday": {
        "Open": "00:00",
        "Close": "00:00"
      }
    },
    {
      "Saturday": {
        "Open": "00:00",
        "Close": "00:00"
      }
    },
    {
      "Sunday": {
        "Open": "00:00",
        "Close": "00:00"
      }
    }
  ])
  const [site, setSite] = useState("")
  const [start, setStart] = useState(now.toISOString().slice(0, 16))
  const [end, setEnd] = useState(now.toISOString().slice(0, 16))
  const [newProfile, setNewProfile] = useState([])
  const [newWallpaper, setNewWallpaper] = useState([])
  const navigate = useNavigate();


  const dateCalculator = (array) => {
    let dateinNumber = 0
    let newDateTime = [
      ...array.split('-')
    ]
    newDateTime[2] = newDateTime[2].toString().split('T')
    newDateTime[2][1] = newDateTime[2][1].toString().split(':')
    newDateTime = newDateTime.flat().flat()
    for (let i = newDateTime.length - 1; i >= 0; i--) {
      dateinNumber += parseInt(newDateTime[i]) * Math.pow(100, newDateTime.length - i - 1)
    }
    return dateinNumber
  }


  const fetcher = (e) => {
    e.preventDefault()
    if (id > 0) {
      var checkerDate = new Date()
      checkerDate.setMinutes(checkerDate.getMinutes() - checkerDate.getTimezoneOffset());
      switch (type) {
        case "Event":
          if (dateCalculator(start) <= dateCalculator(end)) {
            if ((dateCalculator(checkerDate.toISOString().slice(0, 16))) < dateCalculator(start.slice(0, 16)) && dateCalculator(checkerDate.toISOString().slice(0, 16)) < dateCalculator(end.slice(0, 16))) {
              axios.post("/api/event/new", {
                name: name.trim(),
                description: desc.trim(),
                place: place.trim(),
                pageURL: site.trim(),
                startDate: start.slice(0, 16),
                endDate: end.slice(0, 16)
              }).then((res) => {
                if (res.status == 200) {
                  axios.post("/api/eventshelper/new", {
                    eventID: res.data['id'],
                    userID: id,
                    role: 0
                  }).then(() => {
                    if (newProfile.length < 1 && newWallpaper.length < 1) {
                      navigate('/events/' + name + '/' + res.data.id)
                    }
                    if (newProfile.length > 0) {
                      let fd = new FormData()
                      fd.append('image', newProfile[0])
                      fd.append('outsideID', res.data['id'])
                      fd.append('place', "event")
                      axios.post('/api/profilepics/new', fd, {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }).then(() => {
                          navigate('/events/' + name + '/' + res.data.id)
                      })
                    }
                    if (newWallpaper.length > 0) {
                      let fd = new FormData()
                      fd.append('image', newWallpaper[0])
                      fd.append('outsideID', res.data['id'])
                      fd.append('place', "event")
                      axios.post('/api/wallpaper/new', fd, {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }).then(() => {
                          navigate('/events/' + name + '/' + res.data.id)
                      })
                    }
                  })
                } else {
                  alerts.error("Something went wrong")
                }
              }).catch((err) => {
                alerts.error(err)
              })
            } else {
              alerts.error("You can't live in the past, look forward!")
            }
          } else {
            alerts.error("Time can't go backward!")
          }
          break;
        case "Page":
          let businessHoursString = JSON.stringify(businessHours)

          axios.post("/api/page/new", {
            name: name.trim(),
            description: desc.trim(),
            webURI: site.trim(),
            phone: phone.trim(),
            email: email.trim(),
            place: place.trim(),
            businessType: businessType.trim(),
            businessHours: businessHoursString,
          }).then((res) => {
            if (res.status == 200) {
              axios.post("/api/pagehelper/new", {
                pageID: res.data['id'],
                userID: id,
                rank: 3
              }).then(() => {
                if (newProfile.length < 1 && newWallpaper.length < 1) {
                  navigate('/pages/' + name + '/' + res.data.id)
                }
                if (newProfile.length > 0) {
                  let fd = new FormData()
                  fd.append('image', newProfile[0])
                  fd.append('outsideID', res.data['id'])
                  fd.append('place', "page")
                  axios.post('/api/profilepics/new', fd, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  }).then(() => {
                    if (newWallpaper.length < 1) {
                      navigate('/pages/' + name + '/' + res.data.id)
                    }
                  })
                }
                if (newWallpaper.length > 0) {
                  let fd = new FormData()
                  fd.append('image', newWallpaper[0])
                  fd.append('outsideID', res.data['id'])
                  fd.append('place', "page")
                  axios.post('/api/wallpaper/new', fd, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  }).then(() => {
                    if (newProfile.length < 1) {
                      navigate('/pages/' + name + '/' + res.data.id)
                    }
                  })
                }
              })
            } else {
              alerts.error("Something went wrong")
            }
          }).catch((err) => {
            alerts.error(err)
          })
          break;
        case "Group":
          axios.post("/api/group/new", {
            name: name.trim(),
            description: desc.trim(),
            status: status
          }).then((res) => {
            if (res.status == 200) {
              axios.post("/api/groupmember/new", {
                groupID: res.data['id'],
                memberID: id,
                rank: 4
              }).then(() => {
                if (newProfile.length < 1 && newWallpaper.length < 1) {
                  navigate('/groups/' + name + '/' + res.data.id)
                }
                if (newProfile.length > 0) {
                  let fd = new FormData()
                  fd.append('image', newProfile[0])
                  fd.append('outsideID', res.data['id'])
                  fd.append('place', "group")
                  axios.post('/api/profilepics/new', fd, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  }).then(() => {
                    if (newWallpaper.length < 1) {
                      navigate('/groups/' + name + '/' + res.data.id)
                    }
                  })
                }
                if (newWallpaper.length > 0) {
                  let fd = new FormData()
                  fd.append('image', newWallpaper[0])
                  fd.append('outsideID', res.data['id'])
                  fd.append('place', "group")
                  axios.post('/api/wallpaper/new', fd, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  }).then(() => {
                    if (newProfile.length < 1) {
                      navigate('/groups/' + name + '/' + res.data.id)
                    }
                  })
                }
              })
            } else {
              alerts.error("Something went wrong")
            }
          }).catch((err) => {
            alerts.error(err)
          })
          break;
        default:
          alerts.error("How did u get here?")
      }
    }
  }
  return (
    <div className='w-full max-h-full'>
      <form onSubmit={fetcher} className="shadow-md w-full rounded px-8 py-8 mb-4 flex flex-col justify-center items-center">
        <h1 className="text-lg md:text-xl lg:text-2xl mb-8 font-bold">
          New {type}
        </h1>
        <div className="w-full max-w-xs">
          <div className="relative mb-4">
            <label htmlFor="Name" className="leading-7 text-gray-900">
              Name:
            </label>
            <input
              type="text"
              id="Name"
              defaultValue={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
              maxLength="32"
              required
              className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="Description" className="leading-7 text-gray-900">
              Description:
            </label>
            <textarea
              type="text"
              id="Description"
              rows="7"
              defaultValue={desc}
              onChange={(e) => {
                setDesc(e.target.value)
              }}
              maxLength={50}
              required
              className="bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          {(type === "Group") ?
            <div className="relative mb-4">
              <label htmlFor="public" className="leading-7 text-gray-900">
                Is the {type} public?
              </label>
              <input
                type="checkbox"
                id="public"
                defaultChecked={status}
                onChange={(e) => {
                  setStatus(e.target.checked)
                }}
                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            : null}
          {(type === "Event" || type === "Page") ?
            <div className='w-full'>
              <div className="relative mb-4">
                <label htmlFor="Place" className="leading-7 text-gray-900">
                  Place:
                </label>
                <input
                  type="text"
                  id="Place"
                  maxLength={32}
                  defaultValue={place} onChange={(e) => { setPlace(e.target.value) }}
                  className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="relative mb-4">
                <label htmlFor="URL" className="leading-7 text-gray-900">
                  Site of the {type}:
                </label>
                <input
                  type="text"
                  id="URL"
                  maxLength={64}
                  defaultValue={site} onChange={(e) => { setSite(e.target.value) }}
                  className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
            </div>
            : null}
          {(type === "Page") ?
            <div className='w-full'>
              <div className="relative mb-4">
                <label htmlFor="Phone" className="leading-7 text-gray-900">
                  Phone number of the {type}:
                </label>
                <input
                  type="text"
                  id="Phone"
                  maxLength={12}
                  placeholder="+36011234567"
                  defaultValue={phone} onChange={(e) => { setPhone(e.target.value.trim()) }}
                  className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="relative mb-4">
                <label htmlFor="Email" className="leading-7 text-gray-900">
                  Email of the {type}:
                </label>
                <input
                  type="text"
                  id="Email"
                  maxLength={32}
                  placeholder="template@btemp.com" defaultValue={email} onChange={(e) => { setEmail(e.target.value) }}
                  className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="relative mb-4">
                <label htmlFor="Business" className="leading-7 text-gray-900">
                  Business Type of the {type}:
                </label>
                <input
                  type="text"
                  id="Business"
                  maxLength={32}
                  placeholder="Marketplace" defaultValue={businessType} onChange={(e) => { setBusinessType(e.target.value) }}
                  className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className='w-full'>
                <span className='float-left pr-4 text-gray-900'>Open hours of the {type}:</span><br />
                {businessHours.map((item) => {
                  let keys = Object.keys(item)
                  return <div className='w-fit float-left' key={keys[0]}>
                    <span className='float-left pr-4 text-gray-900'>{keys[0]}</span><br />
                    Open: <input type="time" className='text-gray-900 rounded border border-gray-300 py-1 px-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' step="3600000" defaultValue={item[keys[0]].Open} onChange={(e) => {
                      let newValues = [...businessHours]
                      for (let i = 0; i < newValues.length; i++) {
                        let key = Object.keys(newValues[i])
                        if (key[0] === keys[0]) {
                          newValues[i][key[0]].Open = e.target.value
                        }
                      }
                      setBusinessHours(newValues)
                    }} /><br />
                    Close: <input type="time" className='text-gray-900 rounded border border-gray-300 py-1 px-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' step="3600000" defaultValue={item[keys[0]].Close} onChange={(e) => {
                      let newValues = [...businessHours]
                      for (let i = 0; i < newValues.length; i++) {
                        let key = Object.keys(newValues[i])
                        if (key[0] === keys[0]) {
                          if (e.target.value > newValues[i][key[0]].Open) {
                            newValues[i][key[0]].Close = e.target.value
                          } else {
                            newValues[i][key[0]].Close = newValues[i][key[0]].Open
                          }
                        }
                      }
                      setBusinessHours(newValues)
                    }} />
                  </div>
                })}
              </div>
            </div>
            : null}
          {(type === "Event") ?
            <div className='w-full'>
              <div className="relative mb-4">
                <label htmlFor="Start" className="leading-7 text-gray-900">
                  Start of the {type}:
                </label>
                <input
                  type="datetime-local"
                  id="Start"
                  defaultValue={start} onChange={(e) => {
                    setStart(e.target.value.slice(0, 16))
                  }}
                  className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="relative mb-4">
                <label htmlFor="End" className="leading-7 text-gray-900">
                  End of the {type}:
                </label>
                <input
                  type="datetime-local"
                  id="End"
                  defaultValue={end} onChange={(e) => {
                    setEnd(e.target.value.slice(0, 16))
                  }}
                  className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
            </div>
            : null}
          <div className="relative mb-4">
            <label htmlFor="NewProfile" className="leading-7 text-gray-900">
              New Profile Picture:
            </label>
            <input
              key={type + "Profile"} type="file"
              id="NewProfile"
                                accept="image/*"
              defaultValue={newProfile.pagetwodata} onChange={(e) => setNewProfile(Array.prototype.slice.call(e.target.files))}
              className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="NewWallpaper" className="leading-7 text-gray-900">
              New Wallpaper:
            </label>
            <input
              key={type + "Wallpaper"} type="file"
              id="NewWallpaper"
                                accept="image/*"
              defaultValue={newWallpaper.pagetwodata} onChange={(e) => setNewWallpaper(Array.prototype.slice.call(e.target.files))}
              className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <button type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Upload New {type}
          </button>
        </div>
      </form>
    </div>
  )
}

export default New;