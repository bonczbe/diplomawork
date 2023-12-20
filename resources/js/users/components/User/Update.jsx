import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../../Redux/userSlice";
import { setMode } from "../../Redux/settingsSlice";
import Cookies from "universal-cookie";
import { useAlert } from "react-alert";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "../../../../sass/popup.css";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';

export function Update() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [tag, setTag] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("");
    const [isNoneGender, setIsNoneGender] = useState(false);
    const [description, setDescription] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [work, setWork] = useState("");
    const [school, setSchool] = useState("");
    const [status, setStatus] = useState("None");
    const [canSeePostsAndImages, setCanSeePostsAndImages] = useState(false);
    const [canSeeBirthDate, setCanSeeBirthDate] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [forChangeProfilePic, setForChangeProfilePic] = useState(0);
    const [forChangeWallPaper, setForChangeWallPaper] = useState(0);
    const [WallPapers, setWallPapers] = useState([]);
    const [ProfPictuers, setProfPictuers] = useState([]);
    const [settedProf, setSettedProf] = useState();
    const [settedWall, setSettedWall] = useState();
    const [newProfile, setNewProfile] = useState([]);
    const [newWallPaper, setNewWallPaper] = useState([]);

    const id = useSelector((state) => state.user.id);
    const alerts = useAlert();
    const dispatch = useDispatch();
    var cookies = new Cookies();

    useEffect(() => {
        axios
            .get("/api/users/" + id)
            .then((response) => {
                setPhone(response.data.phone);
                setTag(response.data.tag);
                setSettedProf(response.data.actualProfilePicID);
                setSettedWall(response.data.actualWallPaperID);
                setForChangeProfilePic(response.data.actualProfilePicID);
                setForChangeWallPaper(response.data.actualWallPaperID);
                if (response.data.gender) setGender(response.data.gender);
                if (response.data.pronouns) setPronouns(response.data.pronouns);
                if (response.data.description)
                    setDescription(response.data.description);
                if (response.data.status) setStatus(response.data.status);
                if (response.data.isDark) setIsDark(response.data.isDark);
                if (response.data.school) setSchool(response.data.school);
                if (response.data.work) setSchool(response.data.work);
                setCanSeePostsAndImages(response.data.canSeePostsAndImages);
                setCanSeeBirthDate(response.data.canSeeBirthDate);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, []);

    useEffect(() => {
        axios
            .get("/api/profilepics/all/index/user/" + id)
            .then((res) => {
                setProfPictuers(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
        axios
            .get("/api/wallpaper/all/index/user/" + id)
            .then((res) => {
                setWallPapers(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const edit = (e) => {
        e.preventDefault();
        var desc = description != "" ? description : null;
        if (
            phone.match(
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
            )
        ) {
            axios
                .put("/api/users/update/" + id, {
                    phone: phone,
                    isDark: isDark,
                    status: status,
                    canSeePostsAndImages: canSeePostsAndImages,
                    canSeeBirthDate: canSeeBirthDate,
                    gender: gender,
                    pronouns: pronouns,
                    tag: tag,
                    password: Buffer.from(password).toString("base64"),
                    work: work,
                    school: school,
                    description: desc,
                })
                .then(() => {
                    dispatch(
                        updateProfile({
                            tag: tag,
                        })
                    );
                    dispatch(setMode({ isDark: isDark }));
                    alerts.success("Prodfile updated successfully")
                })
                .catch((err) => {
                    console.log(err.message);
                });
        } else {
            alerts.error("Phone number is not correct!");
        }
    };
    const editPsswd = (e) => {
        e.preventDefault();
        if (
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(
                newPassword
            )
        ) {
            axios
                .put("/api/users/newPasswd/" + id, {
                    password: Buffer.from(oldPassword).toString("base64"),
                    newPassword: Buffer.from(newPassword).toString("base64"),
                })
                .then(() => {
                    cookies.set(
                        "user",
                        {
                            password:
                                Buffer.from(newPassword).toString("base64"),
                        },
                        { path: "/" }
                    );
                    dispatch(setMode({ isDark: isDark }));
                })
                .catch((err) => {
                    console.log(err.message);
                });
        }
    };

    const newProfileSetter = (e) => {
        e.preventDefault();
        let fd = new FormData();
        fd.append("image", newProfile);
        fd.append("place", "user");
        fd.append("outsideID", id);
        axios
            .post("/api/profilepics/new", fd, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                setSettedProf(res.data.id);
                alerts.success("Profile Picture Added");
            })
            .catch((err) => {
                alerts.error(err.message);
                console.log(err.message);
            });
    };
    const newWallpaperSetter = (e) => {
        e.preventDefault();
        let fd = new FormData();
        fd.append("image", newWallPaper);
        fd.append("place", "user");
        fd.append("outsideID", id);
        axios
            .post("/api/wallpaper/new", fd, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                setSettedWall(res.data.id);
                alerts.success("Wallpaper Added");
            })
            .catch((err) => {
                alerts.error(err.message);
                console.log(err.message);
            });
    };
    const deletePicture = (isProfile) => {
        if (isProfile && settedProf != 1) {
            axios
                .delete("/api/profilepics/delete/" + settedProf + "/user/" + id)
                .then(() => {
                    alerts.success("Profile Picture removed");
                    setProfPictuers(
                        ProfPictuers.filter((image) => {
                            image.id != settedProf;
                        })
                    );
                    setSettedProf(1);
                    setForChangeProfilePic(1);
                })
                .catch((err) => {
                    alerts.error(err);
                });
        } else if (!isProfile && settedWall != 1) {
            axios
                .delete("/api/wallpaper/delete/" + settedWall + "/user/" + id)
                .then(() => {
                    alerts.success("Wallpaper removed");
                    setWallPapers(
                        WallPapers.filter((image) => {
                            image.id != settedWall;
                        })
                    );
                    setSettedWall(1);
                    setForChangeWallPaper(1);
                })
                .catch((err) => {
                    alerts.error(err);
                });
        }
    };
    const handlechangeProf = (index) => {
        setForChangeProfilePic(ProfPictuers[index].id);
    };
    const handlechangeWall = (index) => {
        setForChangeWallPaper(WallPapers[index].id);
    };
    const defaultProfItem = () => {
        let res = 0;
        for (let i = 0; i < ProfPictuers.length; i++) {
            if (forChangeProfilePic === ProfPictuers[i].id) {
                res = i;
            }
        }
        return res;
    };
    const defaultWallItem = () => {
        let res = 0;
        for (let i = 0; i < WallPapers.length; i++) {
            if (forChangeWallPaper === WallPapers[i].id) {
                res = i;
            }
        }
        return res;
    };
    const changeProfileSetter = (e) => {
        e.preventDefault();
        axios
            .put("/api/users/editProfileID/" + id, {
                actualProfilePicID: forChangeProfilePic,
                place: "user",
                uid: id,
            })
            .then(() => {
                setForChangeProfilePic(forChangeProfilePic);
                setSettedProf(forChangeProfilePic);
                alerts.success("Profil Picture setted");
            })
            .catch((err) => {
                alerts.error(err);
            });
    };
    const changeWallpaperSetter = (e) => {
        e.preventDefault();
        axios
            .put("/api/users/editWallpaperID/" + id, {
                actualWallPaperID: forChangeWallPaper,
                place: "user",
                uid: id,
            })
            .then(() => {
                setForChangeWallPaper(forChangeWallPaper);
                setSettedWall(forChangeWallPaper);
                alerts.success("WallPaper setted");
            })
            .catch((err) => {
                alerts.error(err);
            });
    };
    return (
        <div className="flex w-full h-full items-center justify-center">
            <div className="item w-8/12">
                <form onSubmit={edit} className="shadow-md w-full rounded px-8 py-8 mb-4 flex flex-col justify-center items-center">
                    <h1 className="text-lg md:text-xl lg:text-2xl mb-8 font-bold">Edit your data</h1>

                    <div className="w-full max-w-xs">
                        <div className="relative mb-4">
                            <label htmlFor="phone" className="leading-7 text-gray-900">Phone</label>
                            <input
                                id="phone"
                                type="text"
                                maxLength="15"
                                placeholder="+36121234567"
                                autoComplete="off"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.trim())}
                                required
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="description" className="leading-7 text-gray-900">Description</label>
                            <textarea
                                id="description"
                                rows="3"
                                cols="40"
                                placeholder="Description"
                                autoComplete="off"
                                maxLength="50"
                                value={description != null ? description : ""}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="status" className="leading-7 text-gray-900">Status</label>
                            <select
                                id="status"
                                onChange={(e) => setStatus(e.target.value)}
                                value={status}
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            >
                                <option value="None">None</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Complicated">Complicated</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="birth" className="leading-7 text-gray-900">
                                Anyone can see your birth date:{" "}</label>
                            <select
                                id="birth"
                                onChange={(e) => {
                                    e.target.value == "Accept"
                                        ? setCanSeeBirthDate(true)
                                        : setCanSeeBirthDate(false);
                                }}
                                value={canSeeBirthDate ? "Accept" : "Decline"}
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            >
                                <option value="Accept">Accept</option>
                                <option value="Decline">Decline</option>
                            </select>
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="images" className="leading-7 text-gray-900">
                                Anyone can see your images and videos:{" "}</label>
                            <select
                                id="images"
                                onChange={(e) => {
                                    e.target.value == "Accept"
                                        ? setCanSeePostsAndImages(true)
                                        : setCanSeePostsAndImages(false);
                                }}
                                value={canSeePostsAndImages ? "Accept" : "Decline"}
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            >
                                <option value="Accept">Accept</option>
                                <option value="Decline">Decline</option>
                            </select>
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="Gender" className="leading-7 text-gray-900">
                                Gender:{" "}</label>
                            <select
                                id="Gender"
                                onChange={(e) => {
                                    setGender(e.target.value);
                                    e.target.value == "Other"
                                        ? setIsNoneGender(true)
                                        : setIsNoneGender(false);
                                }}
                                value={gender}
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            >
                                <option value="None">None</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="X (non-binary) (Canada Only)">
                                    {"X (non-binary) (Canada Only)"}
                                </option>
                                {gender != "None" &&
                                    gender != "Male" &&
                                    gender != "Female" ? (
                                    <option value={gender}>{gender}</option>
                                ) : null}
                                <option value="Other">Other</option>
                            </select>
                            {isNoneGender ? (
                                <input
                                    maxLength="15"
                                    className={"w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                                    }
                                    type="text"
                                    placeholder="Gender"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value.trim())}
                                    required
                                />
                            ) : null}
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="Pronouns" className="leading-7 text-gray-900">
                                Pronouns</label>
                            <input
                                id="Pronouns"
                                type="text"
                                value={pronouns}
                                onChange={(e) => setPronouns(e.target.value)}
                                required
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"

                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="Tag" className="leading-7 text-gray-900">
                                Tag</label>
                            <input
                                type="text"
                                id="Tag"
                                autoComplete="off"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                required
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"

                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="Theme" className="leading-7 text-gray-900">
                                Website Theme:</label>
                            <select
                                id="Theme"
                                onChange={(e) => {
                                    e.target.value == "Dark"
                                        ? setIsDark(true)
                                        : setIsDark(false);
                                }}
                                value={isDark ? "Dark" : "Light"}
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            >
                                <option value="Dark">Dark</option>
                                <option value="Light">Light</option>
                            </select>
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="School" className="leading-7 text-gray-900">
                                School</label>
                            <input
                                type="text"
                                id="School"
                                autoComplete="off"
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"

                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="Work" className="leading-7 text-gray-900">
                                Work</label>
                            <input
                                type="text"
                                id="Work"
                                autoComplete="off"
                                value={work}
                                onChange={(e) => setWork(e.target.value)}
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"

                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="password" className="leading-7 text-gray-900">
                                Password</label>
                            <input
                                type="password"
                                id="password"
                                autoComplete="off"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"

                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Update Data
                        </button>
                    </div>
                </form>
                <form onSubmit={editPsswd} className="shadow-md w-full rounded px-8 py-8 mb-4 flex flex-col justify-center items-center">
                    <h1 className="text-lg md:text-xl lg:text-2xl mb-8 font-bold">
                        New Password
                    </h1>
                    <div className="w-full max-w-xs">
                        <div className="relative mb-4">
                            <label htmlFor="oldpassword" className="leading-7 text-gray-900">
                                Old Password
                            </label>
                            <input
                                type="text"
                                id="oldpassword"
                                autoComplete="off"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                                className="w-full bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"

                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="newpassword" className="leading-7 text-gray-900">
                                New Password
                            </label>
                            <div className="w-full flex">
                            <input
                                type="text"
                                id="newpassword"
                                autoComplete="off"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-11/12 bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"

                            />
                            <div className="w-1/12">
                                
                            <Tooltip title="Needed: Capital letter, small letter, number and special character and need to be 8 characters atleast.">
                                <InfoTwoToneIcon />
                            </Tooltip>
                            </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
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
                    <Popup
                        trigger={
                                <button className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-4 rounded">
                                    {" "}
                                    Delete the user{" "}
                                </button>
                        }
                        modal
                    >
                        {(close) => (
                            <div className="modal">
                                <button className="close" onClick={close}>
                                    &times;
                                </button>
                                <div className="header">
                                    Do you want to delete this user?
                                </div>
                                <div className="content text-center">
                                    <section className="">
                                        If you hit yes, your profile will be
                                        deleted, can not be return this choice!
                                    </section>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() => {
                                            axios
                                                .delete(
                                                    "/api/users/delete/" +
                                                    id +
                                                    "/" +
                                                    tag
                                                )
                                                .then(() => {
                                                    alerts.success(
                                                        "User deleted!"
                                                    );
                                                    navigate("/welcome");
                                                })
                                                .catch(() => {
                                                    alerts.error(
                                                        "Something went wrong!"
                                                    );
                                                });
                                        }}
                                    >
                                        Yes
                                    </button>
                                </div>
                            </div>
                        )}
                    </Popup>
            </div>
        </div>
    );
}

export default Update;
