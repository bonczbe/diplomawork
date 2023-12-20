import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAlert } from "react-alert"
import axios from 'axios'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../../sass/popup.css'
import { useNavigate } from 'react-router-dom'

export function Update({ pageID, editType, ranks }) {
  const alerts = useAlert()
  const navigate = useNavigate();
  const loggedInID = useSelector((state) => state.user.id)
  const [loading, setLoading] = useState(true)
  const [nameD, setNameD] = useState()
  const [desc, setDesc] = useState()
  const [webURI, setwebURI] = useState()
  const [phone, setPhone] = useState()
  const [email, setEmail] = useState()
  const [place, setPlace] = useState()
  const [businessType, setBusinessType] = useState()
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
  /* The above code is a React useEffect hook that runs when the component mounts or when the
  dependencies (editType, pageID, loggedInID) change. It checks if editType and loading are truthy,
  and if editType is between 1 and 4 and loggedInID is greater than 0. If these conditions are met,
  it sends a GET request to the server to retrieve data for a specific page using the pageID. If the
  request is successful, it sets various state variables with the retrieved data and sets loading to
  false. If the request fails, it navigates to a 404 */
  useEffect(() => {
    if (editType && loading) {
      if (editType > 1 && editType < 4 && loggedInID > 0) {
        axios.get('/api/page/show/' + pageID).then((res) => {
          setNameD(res.data.name)
          setDesc(res.data.description)
          setwebURI(res.data.webURI)
          setPhone(res.data.phone)
          setEmail(res.data.email)
          setPlace(res.data.place)
          setBusinessType(res.data.businessType)
          setBusinessHours(JSON.parse(res.data.businessHours))
          setLoading(false)
        }).catch(() => {
          navigate('/404')
        })
      } else {
        navigate('/unauthorized')
      }
    }
  }, [editType, pageID, loggedInID])

  /**
   * The function updates a page's information and sends a PUT request to the server using axios.
   */
  const update = (e) => {
    e.preventDefault()
    axios.put('/api/page/update/' + pageID + "/" + loggedInID, {
      name: nameD.trim(),
      description: desc.trim(),
      webURI: (typeof webURI === "string") ? webURI.trim() : null,
      phone: (typeof phone === "string") ? phone.trim() : null,
      email: (typeof email === "string") ? email.trim() : null,
      place: (typeof place === "string") ? place.trim() : null,
      businessType: (typeof businessType === "string") ? businessType.trim() : null,
      businessHours: JSON.stringify(businessHours)
    }).then(() => {
      navigate('/pages/settings/' + nameD.trim() + "/" + pageID)
      alerts.success("Page Updated")
    }).catch((err) => {
      alerts.error(err)
    })
  }
  return (loggedInID > 0 && !loading && editType > 1 && editType < 4) ? (
    <div className='w-full h-full'>



      <form onSubmit={update} className="shadow-md w-full rounded px-8 py-8 mb-4 flex flex-col justify-center items-center">
        <h1 className="text-lg md:text-xl lg:text-2xl mb-8 font-bold">
          Update Page Data
        </h1>
        <div className="w-full max-w-xs">
          <div className="relative mb-4">
            <label htmlFor="Name" className="leading-7 text-gray-900">
              Name:
            </label>
            <input
              type="text"
              id="Name"
              className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              defaultValue={nameD} required disabled={editType !== ranks.owner} onChange={(e) => { if (editType == ranks.owner) setNameD(e.target.value) }} maxLength="32"
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="Description" className="leading-7 text-gray-900">
              Description:
            </label>
            <textarea
              id="Description"
              rows="3" cols="40" placeholder="Description" autoComplete="off" maxLength="256"
              defaultValue={(desc != null) ? desc : ""} required onChange={(e) => setDesc(e.target.value)}
              className=" bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="Url" className="leading-7 text-gray-900">
              Site of the Page:
            </label>
            <input
              type="text"
              id="Url"
              className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              defaultValue={webURI} onChange={(e) => setwebURI(e.target.value)}
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="Phone" className="leading-7 text-gray-900">
              Phone:
            </label>
            <input
              type="text"
              id="Phone"
              className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              defaultValue={phone} disabled={editType !== ranks.owner} onChange={(e) => { if (editType == ranks.owner) setPhone(e.target.value) }}
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="Email" className="leading-7 text-gray-900">
              Email:
            </label>
            <input
              type="text"
              id="Email"
              className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              defaultValue={email} disabled={editType !== ranks.owner} onChange={(e) => { if (editType == ranks.owner) setEmail(e.target.value) }}
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="Place" className="leading-7 text-gray-900">
              Place:
            </label>
            <input
              type="text"
              id="Place"
              className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              defaultValue={place} onChange={(e) => setPlace(e.target.value)}
            />
          </div>
          <div className="relative mb-4">
            <label htmlFor="Business" className="leading-7 text-gray-900">
              Business Type:
            </label>
            <input
              type="text"
              id="Business"
              className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              defaultValue={businessType} onChange={(e) => setBusinessType(e.target.value)}
            />
          </div>
          {typeof businessHours === "object" && (

            <div className="mt-4">
                    <span className="text-gray-900 font-medium mb-2">
                      Open hours of the Page:
                    </span>
              {businessHours.map((item) => {
                const keys = Object.keys(item);
                return (
                  <div className="flex flex-col mb-4" key={keys[0]}>
                    <div className="flex flex-row items-center">
                      <span className="text-gray-900 mr-4">{keys[0]}</span>
                      <div className="flex flex-row items-center">
                        <span className="text-gray-900 mr-2">Open:</span>
                        <input
                          type="time"
                          className="w-24 bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                          step="3600000"
                          defaultValue={item[keys[0]].Open}
                          onChange={(e) => {
                            const newValues = [...businessHours];
                            for (let i = 0; i < newValues.length; i++) {
                              const key = Object.keys(newValues[i]);
                              if (key[0] === keys[0]) {
                                newValues[i][key[0]].Open = e.target.value;
                              }
                            }
                            setBusinessHours(newValues);
                          }}
                        />
                      </div>
                      <div className="flex flex-row items-center ml-4">
                        <span className="text-gray-900 mr-2">Close:</span>
                        <input
                          type="time"
                          className="w-24 bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                          step="3600000"
                          defaultValue={item[keys[0]].Close}
                          onChange={(e) => {
                            const newValues = [...businessHours];
                            for (let i = 0; i < newValues.length; i++) {
                              const key = Object.keys(newValues[i]);
                              if (key[0] === keys[0]) {
                                if (e.target.value > newValues[i][key[0]].Open) {
                                  newValues[i][key[0]].Close = e.target.value;
                                } else {
                                  newValues[i][key[0]].Close = newValues[i][key[0]].Open;
                                }
                              }
                            }
                            setBusinessHours(newValues);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Update
          </button>
        </div>
      </form>
      {(editType == ranks.owner) ? <div className='w-full'>
        <Popup
          trigger={<div className='w-full text-center'> <button className="button"> Delete the Page </button></div>}
          modal>
          {close => (
            <div className="modal">
              <button className="close" onClick={close}>
                &times;
              </button>
              <div className="header">
                Do you want to delete this page?
              </div>
              <div className="content text-center">
                <section className='bg-white'>
                  If you hit yes, your Page will be deleted, can not be return this choice!
                </section>
                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                  onClick={() => {
                    axios.delete('/api/page/delete/' + pageID + "/" + loggedInID).then(() => {
                      alerts.success("Page deleted!")
                      navigate('/')
                    }).catch(() => {
                      alerts.error("Something went wrong!")
                    })
                  }}>
                  Yes
                </button>
              </div>
            </div>
          )}
        </Popup>
      </div> : null}
    </div>
  ) : null
}

export default Update
