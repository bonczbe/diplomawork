import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Posts from "./Posts";
import Relations from "./Relations";
import Media from "./Media";
import { useSelector } from "react-redux";
import About from "./About";
import axios from "axios";
import { useAlert } from "react-alert";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "../../../../sass/popup.css";
import AddAPhotoTwoToneIcon from "@mui/icons-material/AddAPhotoTwoTone";
import UploadedContent from "../Chats/UploadedContent";
import Histories from "../History/Histories";
import ReportButton from "../UseMoreFromMOreComponents/ReportButton";
import Loading from "../../../animation/Loading";

function User() {
    const [user, setUser] = useState(undefined);
    const [viewFlow, setViewFlow] = useState(0);
    const [isBlocked, setIsBlocked] = useState(0);
    const [isAdded, setIsAdded] = useState(0);
    const [relation, setRelation] = useState();
    const [uploadedHistory, setUploadedHistory] = useState([]);
    const [messageFileImage, setMessageFileImage] = useState([]);
    const [messageFile, setMessageFile] = useState([]);
    const [newImages, setNewImages] = useState([]);
    let { tag } = useParams();
    const navigate = useNavigate();
    const alerts = useAlert();
    const loggedInID = useSelector((state) => state.user.id);
    const ProfSize = 120;
    const bordRadSize = 20;
    const [reportedByUser, setReportedByUser] = useState(false);
    const [reportedByUserprof, setReportedByUserProf] = useState(false);
    const [reportedByUserProfile, setReportedByUserProfile] = useState(false);

    const setterReportedByUser = (fromcalled) => {
        setReportedByUser(fromcalled);
    };
    const setterReportedByUserProf = (fromcalled) => {
        setReportedByUserProf(fromcalled);
    };

    useEffect(() => {
        setViewFlow(0);
        axios
            .get("/api/usersNeeded/" + tag)
            .then((response) => {
                if (response.data) {
                    setUser(response.data);
                } else {
                    navigate("/404");
                }
            })
            .catch((err) => {
                if (err.message.includes("500") || err.message.includes("404"))
                    navigate("/404");
                else console.log(err.message);
            });
    }, [tag]);

    useEffect(() => {
        if (loggedInID > 0 && user)
            axios
                .get("/api/relations/isFriend/" + user.id + "/" + loggedInID)
                .then((response) => {
                    if (response.data.length > 0) {
                        response.data.map((datas) => {
                            setRelation(datas);
                            if (datas.type == 4 && datas.who == loggedInID) {
                                setIsBlocked(1);
                            } else if (
                                datas.type == 4 &&
                                datas.who != loggedInID
                            ) {
                                setIsBlocked(2);
                            }
                        });
                    }
                })
                .catch((Err) => console.log(Err));
    }, [loggedInID, tag, user, isAdded, isBlocked]);

    const renderViewFlow = (param, userID) => {
        switch (param) {
            case 1:
                return <Media id={userID} key={userID} />;
            case 2:
                return (
                    <Relations
                        id={userID}
                        loggedInID={loggedInID}
                        key={userID}
                    />
                );
            default:
                return <Posts id={userID} key={userID} />;
        }
    };
    const RemoveFromList = (item) => {
        let helper = messageFile.filter((image) => {
            return image.name != item.image.name;
        });
        setMessageFile(helper);
    };
    const unblock = (isAlert) => {
        if (user.id != loggedInID) {
            axios
                .delete(
                    "/api/relations/delete/" +
                        relation.id +
                        "/" +
                        loggedInID +
                        "/" +
                        user.id
                )
                .then(() => {
                    if (isAlert) {
                        alerts.success("User unblocked");
                    }
                    setIsBlocked(0);
                    setIsAdded(false);
                    setRelation();
                })
                .catch((err) => console.log(err));
        }
    };
    const addFriend = () => {
        axios
            .post("/api/relations/new", {
                user1ID: loggedInID,
                user2ID: user.id,
                who: loggedInID,
                type: 0,
            })
            .then(() => {
                alerts.success("User added");
                setIsBlocked(0);
                setIsAdded(true);
            })
            .catch((err) => console.log(err));
    };
    const accept = () => {
        axios
            .put("/api/relations/update/" + relation.id, {
                user1ID: loggedInID,
                user2ID: user.id,
                who: loggedInID,
                type: 1,
            })
            .then(() => {
                alerts.success("User Accepted");
                setIsBlocked(0);
                setIsAdded(true);
            })
            .catch((err) => console.log(err));
    };

    const newHistory = (e) => {
        e.preventDefault();
        let allUploaded = true;
        if (messageFile.length > 0) {
            for (let i = 0; i < messageFile.length; i++) {
                let fd = new FormData();
                fd.append("fileImage", messageFile[i]);
                fd.append("who", loggedInID);
                axios
                    .post("/api/history/new", fd, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    })
                    .then((res) => {
                        setUploadedHistory(res.data);
                    })
                    .catch((err) => {
                        allUploaded = false;
                        console.log(err.message);
                    });
            }
            if (allUploaded) {
                alerts.success("Image(s) uploaded");
            } else {
                alerts.error("One or more image(s) weren't uploaded");
            }
            setMessageFile([]);
        } else {
            alerts.info("You need to select images first!");
        }
    };
    useEffect(() => {
        if (messageFile.length < 1) {
            setMessageFileImage([]);
        }
        const newImageUrls = [];
        messageFile.forEach((image) =>
            newImageUrls.push({ url: URL.createObjectURL(image), image: image })
        );
        setMessageFileImage(newImageUrls);
    }, [messageFile]);

    return (
        <div className="w-full h-full">
            {user != undefined ? (
                <div key={tag + "+" + user.id}>
                    <div className="Background">
                        <Popup
                            trigger={
                                <div className="w-full">
                                    {reportedByUser == false ? (
                                        <img
                                            src={
                                                user.WallpaperURI
                                                    .WallPaperPicURI
                                            }
                                            alt="Wallpaper"
                                            className="w-full object-fill"
                                            style={{
                                                height: 170,
                                                borderBottomLeftRadius:
                                                    bordRadSize - 10,
                                                borderBottomRightRadius:
                                                    bordRadSize - 10,
                                                marginBottom: 10,
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src={"/images/sensitive.jpg"}
                                            alt="Profile Picture"
                                        />
                                    )}
                                </div>
                            }
                            modal
                        >
                            {(close) => (
                                <div className="modal">
                                    <button className="close" onClick={close}>
                                        &times;
                                    </button>
                                    <div className="content text-center">
                                        {reportedByUser == false ? (
                                            <div className="py-2">
                                                <ReportButton
                                                    fromWhere={"wallPaper"}
                                                    setterReportedByUser={
                                                        setterReportedByUser
                                                    }
                                                    outsideID={
                                                        user.WallpaperURI.id
                                                    }
                                                />
                                                <img
                                                    src={
                                                        user.WallpaperURI
                                                            .WallPaperPicURI
                                                    }
                                                    alt="Wallpaper"
                                                    className="w-full object-fill"
                                                />
                                            </div>
                                        ) : (
                                            <img
                                                src={"/images/sensitive.jpg"}
                                                alt="Profile Picture"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </Popup>
                    </div>
                    <div className="Important">
                        <section className="w-full break-words h-fit">
                            <Popup
                                trigger={
                                    <div className="w-full">
                                        {reportedByUserprof == false ? (
                                            <img
                                                src={
                                                    user.ProfilePicURI
                                                        .profilePicURI
                                                }
                                                alt="Profile Picture"
                                                style={{
                                                    height: ProfSize,
                                                    width: ProfSize,
                                                    borderRadius: bordRadSize,
                                                    float: "left",
                                                    marginRight: 50,
                                                }}
                                            />
                                        ) : (
                                            <img
                                                src={"/images/sensitive.jpg"}
                                                alt="Profile Picture"
                                            />
                                        )}
                                    </div>
                                }
                                modal
                            >
                                {(close) => (
                                    <div className="modal">
                                        <button
                                            className="close"
                                            onClick={close}
                                        >
                                            &times;
                                        </button>
                                        <div className="content text-center">
                                            {reportedByUserprof == false ? (
                                                <div className="py-2">
                                                    <ReportButton
                                                        fromWhere={"profilePic"}
                                                        setterReportedByUser={
                                                            setterReportedByUserProf
                                                        }
                                                        outsideID={
                                                            user.ProfilePicURI
                                                                .id
                                                        }
                                                    />
                                                    <img
                                                        src={
                                                            user.ProfilePicURI
                                                                .profilePicURI
                                                        }
                                                        alt="Profile Picture"
                                                    />
                                                </div>
                                            ) : (
                                                <img
                                                    src={
                                                        "/images/sensitive.jpg"
                                                    }
                                                    alt="Profile Picture"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Popup>
                            <span
                                style={{
                                    fontFamily: "cursive",
                                    fontSize: "xx-large",
                                    letterSpacing: "0.2em",
                                    lineHeight: "1.3em",
                                }}
                                className=" truncate block"
                            >
                                {user.firstName + " "}
                                {user.middleName != "null" ? (
                                    <span>{user.middleName} </span>
                                ) : (
                                    ""
                                )}
                                {user.lastName}
                            </span>
                            <span
                                style={{
                                    fontFamily: "cursive",
                                    fontSize: "normal",
                                    letterSpacing: "0.2em",
                                    lineHeight: "1.3em",
                                }}
                                className=" truncate block"
                            >
                                {"( " + user.tag + " )"}
                            </span>
                            <div className="flex">
                                <About user={user} />
                                <div
                                    className="item flex flex-col"
                                    key={tag + ":" + loggedInID}
                                >
                                    {loggedInID != user.id ? (
                                        loggedInID > 0 &&
                                        typeof relation == "undefined" ? (
                                            <button
                                                onClick={() => {
                                                    addFriend();
                                                }}
                                            >
                                                Add Friend
                                            </button>
                                        ) : loggedInID > 0 &&
                                          typeof relation != "undefined" &&
                                          (isAdded || relation.type == 0) ? (
                                            <div>
                                                {relation.who == loggedInID ? (
                                                    <button
                                                        onClick={() => {
                                                            unblock(false);
                                                        }}
                                                    >
                                                        Remove Request
                                                    </button>
                                                ) : (
                                                    <div>
                                                        <button
                                                            onClick={() => {
                                                                accept();
                                                            }}
                                                        >
                                                            Accept Request
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                unblock(false);
                                                            }}
                                                        >
                                                            Remove Request
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : loggedInID > 0 ? (
                                            <button
                                                onClick={() => {
                                                    unblock(false);
                                                }}
                                            >
                                                Remove Friend
                                            </button>
                                        ) : null
                                    ) : null}
                                    <button
                                        onClick={() => {
                                            setViewFlow(0);
                                        }}
                                    >
                                        Posts
                                    </button>
                                    {loggedInID > 0 ? (
                                        <button
                                            onClick={() => {
                                                setViewFlow(2);
                                            }}
                                        >
                                            Friends
                                        </button>
                                    ) : null}
                                    {user.canSeePostsAndImages ? (
                                        <button
                                            onClick={() => {
                                                setViewFlow(1);
                                            }}
                                        >
                                            Media
                                        </button>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div>
                        </section>
                        <div>
                            {1 !== isBlocked &&
                            isBlocked !== 2 &&
                            reportedByUserProfile == false ? (
                                <div
                                    className={
                                        "w-full overflow-x-auto h-28  flex flex-row relative"
                                    }
                                >
                                    {user.id == loggedInID ? (
                                        <div className=" float-left mx-3  h-28 w-16">
                                            <Popup
                                                trigger={
                                                    <div className="w-full text-center">
                                                        <button className="button border-2 border-neutral-800 h-20 w-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 justify-center items-center flex">
                                                            {" "}
                                                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-neutral-800 rounded-lg p-2">
                                                                <AddAPhotoTwoToneIcon />
                                                            </div>{" "}
                                                        </button>
                                                    </div>
                                                }
                                                modal
                                            >
                                                {(close) => (
                                                    <div className="modal">
                                                        <button
                                                            className="close"
                                                            onClick={close}
                                                        >
                                                            &times;
                                                        </button>
                                                        <div className="header">
                                                            {" "}
                                                            Add new Histories{" "}
                                                        </div>
                                                        <div className="content text-center">
                                                            <form
                                                                onSubmit={
                                                                    newHistory
                                                                }
                                                                className="w-full"
                                                            >
                                                                <div className="relative h-20">
                                                                    <div className="absolute bottom-0 z-[99] left-0 right-0 overflow-x-auto mx-3 flex flex-row h-20">
                                                                        {messageFileImage.map(
                                                                            (
                                                                                item
                                                                            ) => {
                                                                                return (
                                                                                    <UploadedContent
                                                                                        item={
                                                                                            item
                                                                                        }
                                                                                        key={
                                                                                            item.url
                                                                                        }
                                                                                        RemoveFromList={
                                                                                            RemoveFromList
                                                                                        }
                                                                                        isHistories={
                                                                                            true
                                                                                        }
                                                                                    />
                                                                                );
                                                                            }
                                                                        )}
                                                                        &nbsp;
                                                                    </div>
                                                                </div>
                                                                <section className="w-full">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*, video/mp4, video/ogv, video/ogg, video/webm"
                                                                        multiple
                                                                        value={
                                                                            newImages.pagetwodata
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setMessageFile(
                                                                                Array.prototype.slice.call(
                                                                                    e
                                                                                        .target
                                                                                        .files
                                                                                )
                                                                            )
                                                                        }
                                                                        className="block mb-5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                                                    />
                                                                </section>
                                                                <button
                                                                    type="submit"
                                                                    className="w-fit"
                                                                >
                                                                    Upload New
                                                                    Images
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                )}
                                            </Popup>
                                        </div>
                                    ) : null}
                                    {
                                        <Histories
                                            fromCalled={"UserPanel"}
                                            uploadedHistory={uploadedHistory}
                                            userID={user.id}
                                        />
                                    }
                                </div>
                            ) : isBlocked == 2 ? (
                                <div className="w-full text-center">
                                    <span className="float-left w-fit">
                                        You are blocked!
                                    </span>
                                </div>
                            ) : (
                                <div className="w-full text-center">
                                    <span className="float-left w-fit">
                                        User is blocked by you
                                    </span>
                                    <button
                                        onClick={() => {
                                            unblock(true);
                                        }}
                                    >
                                        Unblock Here
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="max-h-full w-full overflow-y-auto">
                            {1 !== isBlocked &&
                            isBlocked !== 2 &&
                            reportedByUserProfile == false ? (
                                renderViewFlow(viewFlow, user.id)
                            ) : isBlocked == 2 ? (
                                <div className="w-full text-center">
                                    <span className="float-left w-fit">
                                        You are blocked!
                                    </span>
                                </div>
                            ) : (
                                <div className="w-full text-center">
                                    <span className="float-left w-fit">
                                        User is blocked by you
                                    </span>
                                    <button
                                        onClick={() => {
                                            unblock(true);
                                        }}
                                    >
                                        Unblock Here
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h1 className="w-full text-2xl text-center pt-8">Loading...</h1>
                    <Loading />
                </div>
            )}
        </div>
    );
}

export default User;
