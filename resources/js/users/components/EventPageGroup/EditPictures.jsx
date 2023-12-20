import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Carousel } from 'react-responsive-carousel'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router-dom'

function EditPictures({ spaceID, editType, place }) {
    const alerts = useAlert();
    const [loading, setLoading] = useState(true)

    const [WallPapers, setWallPapers] = useState([])//the file for upload
    const [ProfPictuers, setProfPictuers] = useState([])//the file for upload
    const [settedProf, setSettedProf] = useState()
    const [settedWall, setSettedWall] = useState()
    const [newProfile, setNewProfile] = useState([])
    const [newWallPaper, setNewWallPaper] = useState([])
    const [forChangeProfilePic, setForChangeProfilePic] = useState(0)
    const [forChangeWallPaper, setForChangeWallPaper] = useState(0)
    const navigate = useNavigate();

    useEffect(() => {
        if (editType && loading) {
            if (editType > 1) {
                switch (place) {
                    case "page":
                        axios.get('/api/' + place + '/show/' + spaceID).then((res) => {
                            setForChangeProfilePic(res.data.actualProfilePicID)
                            setSettedProf(res.data.actualProfilePicID)
                            setSettedWall(res.data.actualWallPaperID)
                            setForChangeWallPaper(res.data.actualWallPaperID)
                            setLoading(false)
                        }).catch((err) => {
                            console.log(err)
                            navigate('/404')
                        })
                        if (editType == 3) {
                            gettingImager()
                        }
                        break;
                    case "group":
                        axios.get('/api/' + place + '/show/' + spaceID).then((res) => {
                            setForChangeProfilePic(res.data.actualProfileID)
                            setSettedProf(res.data.actualProfileID)
                            setSettedWall(res.data.actualWallPaperID)
                            setForChangeWallPaper(res.data.actualWallPaperID)
                            setLoading(false)
                        }).catch((err) => {
                            console.log(err)
                            navigate('/404')
                        })
                        if (editType == 4) {
                            gettingImager()
                        }
                        break;
                    case "event":
                        axios.get('/api/' + place + '/show/' + spaceID).then((res) => {
                            setForChangeProfilePic(res.data.actualProfilePicID)
                            setSettedProf(res.data.actualProfilePicID)
                            setSettedWall(res.data.actualWallPaperID)
                            setForChangeWallPaper(res.data.actualWallPaperID)
                            setLoading(false)
                        }).catch((err) => {
                            console.log(err)
                            navigate('/404')
                        })
                        if (editType == 2) {
                            gettingImager()
                        }
                        break;
                    default:
                        console.log("How???");
                }
            } else {
                navigate('/unauthorized')
            }
        }
    }, [editType])

    const gettingImager = () => {
        axios.get('/api/profilepics/all/index/' + place + '/' + spaceID).then((res) => {
            setProfPictuers(res.data)
        }).catch((err) => {
            console.log(err)
        })
        axios.get('/api/wallpaper/all/index/' + place + '/' + spaceID).then((res) => {
            setWallPapers(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }

    const newProfileSetter = (e) => {
        e.preventDefault()
        let fd = new FormData()
        fd.append('image', newProfile)
        fd.append('place', place)
        fd.append('outsideID', spaceID)
        axios.post('/api/profilepics/new', fd, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then((res) => {
            setSettedProf(res.data.id)
            alerts.success("Profile Picture Added")
        }).catch(err => {
            alerts.error(err.message)
            console.log(err.message)
        })
    }
    const newWallpaperSetter = (e) => {
        e.preventDefault()
        let fd = new FormData()
        fd.append('image', newWallPaper)
        fd.append('place', place)
        fd.append('outsideID', spaceID)
        axios.post('/api/wallpaper/new', fd, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then((res) => {
            setSettedWall(res.data.id)
            alerts.success("Wallpaper Added")
        }).catch(err => {
            alerts.error(err.message)
            console.log(err.message)
        })
    }
    const defaultProfItem = () => {
        let res = 0
        for (let i = 0; i < ProfPictuers.length; i++) {
            if (forChangeProfilePic === ProfPictuers[i].id) {
                res = i
            }
        }
        return res
    }
    const defaultWallItem = () => {
        let res = 0
        for (let i = 0; i < WallPapers.length; i++) {
            if (forChangeWallPaper === WallPapers[i].id) {
                res = i
            }
        }
        return res
    }
    const handlechangeProf = (index) => {
        setForChangeProfilePic(ProfPictuers[index].id)
    }
    const handlechangeWall = (index) => {
        setForChangeWallPaper(WallPapers[index].id)
    }
    const deletePicture = (isProfile) => {
        if (isProfile && settedProf != 1) {
            axios.delete('/api/profilepics/delete/' + settedProf + '/' + place + '/' + spaceID).then(() => {
                alerts.success("Profile Picture removed")
                setProfPictuers(ProfPictuers.filter((image) => { image.id != settedProf }))
                defaultProfItem()
                setSettedProf(1)
                setForChangeProfilePic(1)
            }).catch((err) => {
                alerts.error(err)
            })
        } else if (!isProfile && settedWall != 1) {
            axios.delete('/api/wallpaper/delete/' + settedWall + '/' + place + '/' + spaceID).then(() => {
                alerts.success("Wallpaper removed")
                setWallPapers(WallPapers.filter((image) => { image.id != settedWall }))
                defaultProfItem()
                setSettedWall(1)
                setForChangeWallPaper(1)
            }).catch((err) => {
                alerts.error(err)
            })
        }
    }
    const changeProfileSetter = (e) => {
        e.preventDefault()
        axios.put('/api/' + place + '/editProfileID/' + spaceID, {
            actualProfilePicID: forChangeProfilePic,
            place: place,
            uid: spaceID
        }).then(() => {
            setForChangeProfilePic(forChangeProfilePic)
            setSettedProf(forChangeProfilePic)
            alerts.success('Profil Picture setted')
        }).catch((err) => {
            alerts.error(err)
        })
    }
    const changeWallpaperSetter = (e) => {
        e.preventDefault()
        axios.put('/api/' + place + '/editWallpaperID/' + spaceID, {
            actualWallPaperID: forChangeWallPaper,
            place: place,
            uid: spaceID
        }).then(() => {
            setForChangeWallPaper(forChangeWallPaper)
            setSettedWall(forChangeWallPaper)
            alerts.success('WallPaper setted')
        }).catch((err) => {
            alerts.error(err)
        })
    }
    return (
        <div className="flex w-full items-center justify-center">
            <div className="item w-8/12">
                <form onSubmit={newProfileSetter} className="shadow-md w-full rounded px-8 py-8 mb-4 flex flex-col justify-center items-center">
                    <h1 className="text-lg md:text-xl lg:text-2xl mb-8 font-bold">New Profile Picture</h1>
                    <div className="w-full max-w-xs">
                        <div className="relative mb-4">
                            <label htmlFor="newProf" className="leading-7 text-gray-900">
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                id="newProf"
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"

                                accept="image/* video/webm"
                                onChange={(e) => setNewProfile(e.target.files[0])}
                            />
                        </div>
                        <button type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Upload
                        </button>
                    </div>
                </form>
                <form onSubmit={newWallpaperSetter} className="shadow-md w-full rounded px-8 py-8 mb-4 flex flex-col justify-center items-center">
                    <h1 className="text-lg md:text-xl lg:text-2xl mb-8 font-bold">
                        New WallPaper
                    </h1>
                    <div className="w-full max-w-xs">
                        <div className="relative mb-4">
                            <label htmlFor="newWall" className="leading-7 text-gray-900">
                                Wallpaper
                            </label>
                            <input
                                type="file"
                                id="newWall"
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"

                                accept="image/*, video/webm"
                                onChange={(e) => setNewWallPaper(e.target.files[0])}
                            />
                        </div>
                        <button type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Upload
                        </button>
                    </div>
                </form>
                {ProfPictuers.length > 0 ? (
                    <form
                        onSubmit={changeProfileSetter}
                        className="shadow-md w-full h-full rounded px-8 py-8 mb-4 flex flex-col justify-center items-center"
                    >
                        <h1 className="text-lg md:text-xl item lg:text-2xl mb-8 font-bold">
                            Change Profile Picture
                        </h1>
                        <Carousel
                            autoPlay={false}
                            swipeable
                            onChange={handlechangeProf}
                            selectedItem={defaultProfItem()}
                        >
                            {ProfPictuers.map((file) => {
                                return (
                                    <div key={file.id}>
                                        <img
                                            src={file.profilePicURI}
                                            className="max-h-64 object-contain"
                                        />
                                    </div>
                                );
                            })}
                        </Carousel>
                        <button type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >Change</button>
                    </form>
                ) : null}

                {WallPapers.length > 0 ? (
                    <form
                        onSubmit={changeWallpaperSetter}
                        className="shadow-md w-full h-full item rounded px-8 py-8 mb-4 flex flex-col justify-center items-center"
                    >
                        <h1 className="text-lg md:text-xl item lg:text-2xl mb-8 font-bold">
                            Change Wallpaper
                        </h1>
                        <Carousel
                            autoPlay={false}
                            swipeable
                            onChange={handlechangeWall}
                            selectedItem={defaultWallItem()}
                        >
                            {WallPapers.map((file) => {
                                return (
                                    <div key={file.id}>
                                        <img
                                            src={file.WallPaperPicURI}
                                            className="max-h-64 object-contain"
                                        />
                                    </div>
                                );
                            })}
                        </Carousel>
                        <button type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >Change</button>
                    </form>
                ) : null}
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-4 rounded"
                    onClick={() => {
                        deletePicture(true);
                    }}
                >
                    Delete Profile Picure
                </button>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-4 rounded"
                    onClick={() => {
                        deletePicture(false);
                    }}
                >
                    Delete Wallpaper
                </button>
            </div>
        </div>
    )
}

export default EditPictures