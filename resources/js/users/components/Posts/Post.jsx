import axios from "axios";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Comment from "./Comment";
import { useAlert } from "react-alert";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "../../../../sass/popup.css";
import Reactions from "./Reactions";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { Link } from "react-router-dom";
import ReportButton from "../UseMoreFromMOreComponents/ReportButton";
import Loading from "../../../animation/Loading";

function Post({ postdata, id, place, functionRemove, canPost, fromAdmin }) {
    let loggedInId = 0;
    if (!fromAdmin) {
        loggedInId = useSelector((state) => state.user.id);
    }
    const [bigger, setBigger] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [removedComment, setRemovedComment] = useState(0);
    const [Comments, setComments] = useState();
    const [autoPlayCarusel, setAutoPlayCarusel] = useState(true);
    const alerts = useAlert();
    const [newComments, setNewComments] = useState("");
    const [editImages, setEditImages] = useState([]);
    const [editText, setEditText] = useState("");
    const [removeImage, setRemoveImage] = useState([]);
    const [removeableActive, setRemoveableActive] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reportedByUser, setReportedByUser] = useState(false);

    const setterReportedByUser = (fromcalled) => {
        setReportedByUser(fromcalled);
    };

    const deletePost = () => {
        switch (place) {
            case "normalPost":
                axios
                    .delete("/api/post/delete/" + postdata.id)
                    .then((res) => {
                        alerts.success("Post Removed");
                        functionRemove(postdata);
                    })
                    .catch((error) => {
                        alerts.error("Post deletion failed");
                        console.log(error);
                    });
                break;
            case "pagePost":
                axios
                    .delete("/api/pagepost/delete/" + postdata.id)
                    .then(() => {
                        alerts.success("Post Removed");
                        functionRemove(postdata);
                    })
                    .catch((error) => {
                        alerts.error("Post deletion failed");
                        console.log(error);
                    });
                break;
            case "groupPost":
                axios
                    .delete("/api/grouppost/delete/" + postdata.id)
                    .then(() => {
                        alerts.success("Post Removed");
                        functionRemove(postdata);
                    })
                    .catch((error) => {
                        alerts.error("Post deletion failed");
                        console.log(error);
                    });
                break;
            default:
                break;
        }
    };
    useEffect(() => {
        if (postdata.isFile) {
            var images = [];
            postdata.files.map((file) => {
                images.push(file);
            });
            setEditImages(images);
        }
        var editText = postdata.text;
        setEditText(editText);
    }, []);

    useEffect(() => {
        if (Comments) {
            const newComments = Comments.filter(
                (comm) => comm.id !== removedComment
            );
            setComments(newComments);
        }
    }, [removedComment]);

    const refresh = (CommentData) => {
        setRemovedComment(CommentData.id);
    };
    useEffect(() => {
        if (place === "normalPost" || place === "groupPost") {
            if (loggedInId > 0 && postdata)
                axios
                    .get(
                        "/api/relations/isFriend/" +
                            postdata.userID +
                            "/" +
                            loggedInId
                    )
                    .then((response) => {
                        if (response.data.length > 0) {
                            response.data.map((datas) => {
                                if (datas.type == 4) {
                                    setIsBlocked(true);
                                }
                            });
                        }
                    })
                    .catch((Err) => console.log(Err));
        }
        setLoading(false);
    }, [loggedInId]);

    useEffect(() => {
        switch (place) {
            case "normalPost":
                if (loggedInId > 0)
                    axios
                        .get("/api/comments/all/post/" + postdata.id)
                        .then((response) => {
                            if (response.data.length > 0) {
                                setComments(response.data);
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                break;
            case "pagePost":
                if (loggedInId > 0)
                    axios
                        .get("/api/pagepostcomment/" + postdata.id)
                        .then((response) => {
                            if (response.data.length > 0) {
                                setComments(response.data);
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                break;
            case "groupPost":
                if (loggedInId > 0)
                    axios
                        .get("/api/grouppostcomment/all/" + postdata.id)
                        .then((response) => {
                            if (response.data.length > 0) {
                                setComments(response.data);
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                break;
            default:
                break;
        }
    }, [isBlocked]);

    const postEditing = (e) => {
        e.preventDefault();
        let updaterData = {
            text: editText,
        };
        if (postdata.isFile && removeImage.length == postdata.files.length) {
            updaterData = {
                ...updaterData,
                isFile: false,
            };
        }
        if (place === "pagePost") {
            updaterData = {
                ...updaterData,
                who: loggedInId,
            };
        }
        switch (place) {
            case "normalPost":
                axios
                    .put("/api/post/update/" + postdata.id, updaterData)
                    .then(() => {
                        if (removeImage.length > 0) {
                            removeImage.map((itemID) => {
                                axios
                                    .delete("/api/postimage/delete/" + itemID)
                                    .then(() => {
                                        postdata.files.filter((file) => {
                                            file.id !== itemID;
                                        });
                                        postdata.text = editText;
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                                alerts.success("Post Updated!");
                            });
                            setRemoveImage([]);
                        }
                    })
                    .catch(() => {
                        alerts.error("Something went wrong!");
                    });
                break;
            case "pagePost":
                axios
                    .put("/api/pagepost/update/" + postdata.id, updaterData)
                    .then(() => {
                        if (removeImage.length > 0) {
                            removeImage.map((itemID) => {
                                axios
                                    .delete(
                                        "/api/pagepostimage/delete/" + itemID
                                    )
                                    .then(() => {
                                        postdata.files.filter((file) => {
                                            file.id !== itemID;
                                        });
                                        postdata.text = editText;
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                                alerts.success("Post Updated!");
                            });
                            setRemoveImage([]);
                        }
                    })
                    .catch(() => {
                        alerts.error("Something went wrong!");
                    });
                break;
            case "groupPost":
                axios
                    .put("/api/grouppost/update/" + postdata.id, updaterData)
                    .then(() => {
                        if (removeImage.length > 0) {
                            removeImage.map((itemID) => {
                                axios
                                    .delete(
                                        "/api/grouppostimage/delete/" + itemID
                                    )
                                    .then(() => {
                                        postdata.files.filter((file) => {
                                            file.id !== itemID;
                                        });
                                        postdata.text = editText;
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                                alerts.success("Post Updated!");
                            });
                            setRemoveImage([]);
                        }
                    })
                    .catch(() => {
                        alerts.error("Something went wrong!");
                    });
                break;
            default:
                break;
        }
    };

    const addnewComment = (e) => {
        e.preventDefault();
        switch (place) {
            case "normalPost":
                axios
                    .post("/api/comments/new", {
                        postID: postdata.id,
                        userID: loggedInId,
                        what: newComments,
                    })
                    .then((response) => {
                        var datas;
                        if (Comments) {
                            datas = [response.data[0], ...Comments];
                        } else {
                            datas = [response.data[0]];
                        }
                        setComments(datas);
                        setNewComments("");
                        alerts.success("Comment Added");
                    })
                    .catch((error) => {
                        alerts.error("Comment adding failed");
                    });
                break;
            case "pagePost":
                axios
                    .post("/api/pagepostcomment/new", {
                        postID: postdata.id,
                        userID: loggedInId,
                        text: newComments,
                    })
                    .then((response) => {
                        var datas;
                        if (Comments) {
                            datas = [response.data[0], ...Comments];
                        } else {
                            datas = [response.data[0]];
                        }
                        setComments(datas);
                        setNewComments("");
                        alerts.success("Comment Added");
                    })
                    .catch((error) => {
                        alerts.error("Comment adding failed");
                    });
                break;
            case "groupPost":
                axios
                    .post("/api/grouppostcomment/new", {
                        postID: postdata.id,
                        userID: loggedInId,
                        what: newComments,
                    })
                    .then((response) => {
                        var datas;
                        if (Comments) {
                            datas = [response.data[0], ...Comments];
                        } else {
                            datas = [response.data[0]];
                        }
                        setComments(datas);
                        setNewComments("");
                        alerts.success("Comment Added");
                    })
                    .catch((error) => {
                        alerts.error("Comment adding failed");
                    });
                break;
            default:
                break;
        }
    };
    return !isBlocked && !loading && reportedByUser == false ? (
        <div className="w-full h-fit">
            <div className="w-full px-8 border-solid border-2 border-black my-4 rounded-md py-4">
                <img
                    src={postdata.ownerImage.profilePicURI}
                    alt="Profile Picture"
                    style={{
                        height: 50,
                        width: 50,
                        borderRadius: 5,
                        float: "left",
                        marginRight: 10,
                    }}
                />
                {fromAdmin != true ? (
                    <Link
                        to={
                            place == "normalPost"
                                ? "/users/" + postdata.tag
                                : place == "pagePost"
                                ? "/pages/" +
                                  postdata.owner +
                                  "/" +
                                  postdata.pageID
                                : "/groups/" +
                                  postdata.owner +
                                  "/" +
                                  postdata.groupID
                        }
                    >
                        <span
                            className="w-1/2"
                            style={{
                                lineHeight: "50px",
                                fontFamily: "cursive",
                                fontSize: "x-large",
                                letterSpacing: "0.2em",
                            }}
                        >
                            {postdata.owner}
                        </span>
                    </Link>
                ) : (
                    <span
                        className="w-1/2"
                        style={{
                            lineHeight: "50px",
                            fontFamily: "cursive",
                            fontSize: "x-large",
                            letterSpacing: "0.2em",
                        }}
                    >
                        {postdata.owner}
                    </span>
                )}
                <span
                    className="w-1/2"
                    style={{
                        lineHeight: "50px",
                        fontFamily: "cursive",
                        fontSize: "normal",
                        letterSpacing: "0.2em",
                    }}
                >
                    {" "}
                    {postdata.date.toString().replace("T", " ").split(".")[0]}
                </span>
                {(id == loggedInId && place == "normalPost") ||
                (loggedInId > 0 && place == "pagePost") ||
                place == "groupPost" ? ( //Ide kell még edit
                    <div className="float-right">
                        {(fromAdmin != true &&
                            id == loggedInId &&
                            place == "normalPost") ||
                        (loggedInId > 0 && place == "pagePost" && canPost) ||
                        (place == "groupPost" && loggedInId == id) ? (
                            <Popup
                                trigger={
                                    <div className="w-full text-center">
                                        <button className="button">
                                            {" "}
                                            Edit Post{" "}
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
                                            Editing your post{" "}
                                        </div>
                                        <div className="content text-center">
                                            <form onSubmit={postEditing}>
                                                <section className="w-full">
                                                    <textarea
                                                        required
                                                        rows="15"
                                                        placeholder="Description"
                                                        autoComplete="off"
                                                        maxLength="3000"
                                                        value={editText}
                                                        onChange={(e) =>
                                                            setEditText(
                                                                e.target.value
                                                            )
                                                        }
                                                        style={{
                                                            whiteSpace:
                                                                "pre-wrap",
                                                        }}
                                                        className="w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    />
                                                </section>
                                                <section className="w-full mx-4 h-fit">
                                                    {
                                                        editImages.map(
                                                            (file) => {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            "Edit" +
                                                                            file.id
                                                                        }
                                                                        className="w-fit h-fit float-left relative"
                                                                        onMouseEnter={() => {
                                                                            setRemoveableActive(
                                                                                file.id
                                                                            );
                                                                        }}
                                                                        onMouseLeave={() => {
                                                                            setRemoveableActive(
                                                                                0
                                                                            );
                                                                        }}
                                                                        onClick={() => {
                                                                            if (
                                                                                removeableActive >
                                                                                0
                                                                            ) {
                                                                                var removing =
                                                                                    [
                                                                                        ...removeImage,
                                                                                    ];
                                                                                if (
                                                                                    !removing.includes(
                                                                                        removeableActive
                                                                                    )
                                                                                ) {
                                                                                    removing =
                                                                                        [
                                                                                            ...removeImage,
                                                                                            removeableActive,
                                                                                        ];
                                                                                    setRemoveImage(
                                                                                        removing
                                                                                    );
                                                                                } else {
                                                                                    removing =
                                                                                        removeImage.filter(
                                                                                            (
                                                                                                filtered
                                                                                            ) =>
                                                                                                filtered !==
                                                                                                removeableActive
                                                                                        );
                                                                                    setRemoveImage(
                                                                                        removing
                                                                                    );
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* Esetleg lehetne CSS jelölés, hogy melyik elem kerül törlésre majd! */}
                                                                        {removeableActive ===
                                                                        file.id ? (
                                                                            <DeleteTwoToneIcon className="absolute top-0 left-0 bg-red-900 rounded-full h-36 w-36" />
                                                                        ) : null}
                                                                        {file.imageURI.endsWith(
                                                                            ".mp4"
                                                                        ) ||
                                                                        file.imageURI.endsWith(
                                                                            ".ogv"
                                                                        ) ||
                                                                        file.imageURI.endsWith(
                                                                            ".ogg"
                                                                        ) ? (
                                                                            <video
                                                                                style={{
                                                                                    pointerEvents:
                                                                                        "all",
                                                                                }}
                                                                                className={
                                                                                    "max-h-52 object-contain mr-3"
                                                                                }
                                                                                controls
                                                                            >
                                                                                <source
                                                                                    src={
                                                                                        file.imageURI
                                                                                    }
                                                                                    style={{
                                                                                        pointerEvents:
                                                                                            "all",
                                                                                    }}
                                                                                />
                                                                                Your
                                                                                browser
                                                                                does
                                                                                not
                                                                                support
                                                                                the
                                                                                video
                                                                                tag.
                                                                            </video>
                                                                        ) : (
                                                                            <img
                                                                                style={{
                                                                                    pointerEvents:
                                                                                        "all",
                                                                                }}
                                                                                alt="Post image"
                                                                                src={
                                                                                    file.imageURI
                                                                                }
                                                                                className={
                                                                                    "max-h-52 object-contain mr-3"
                                                                                }
                                                                            />
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                        )
                                                    }
                                                </section>
                                                <button
                                                    type="submit"
                                                    className="w-fit"
                                                >
                                                    Update your Post
                                                </button>{" "}
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </Popup>
                        ) : null}
                        <section className="flex flex-col">
                            {(id == loggedInId && place == "normalPost") ||
                            (loggedInId > 0 &&
                                place == "pagePost" &&
                                canPost) ||
                            (place == "groupPost" &&
                                (canPost || loggedInId == id)) ? (
                                <button
                                    onClick={() => {
                                        deletePost();
                                    }}
                                >
                                    Delete Post
                                </button>
                            ) : null}
                            <button
                                onClick={() => {
                                    let link =
                                        location.protocol +
                                        "//" +
                                        location.host +
                                        "/post/" +
                                        place.split("Post")[0] +
                                        "/" +
                                        postdata.id;
                                    navigator.clipboard.writeText(link);
                                    alerts.info("Copied to clipboard");
                                }}
                            >
                                Share
                            </button>
                            {id != loggedInId && place == "normalPost" && fromAdmin==undefined ? (
                                <ReportButton
                                    fromWhere={place}
                                    setterReportedByUser={setterReportedByUser}
                                    outsideID={postdata.id}
                                />
                            ) : ((place != "normalPost" && fromAdmin==undefined)?(
                                <ReportButton
                                    fromWhere={place}
                                    setterReportedByUser={setterReportedByUser}
                                    outsideID={postdata.id}
                                />
                            ):(
                                null
                            ))}
                        </section>
                    </div>
                ) : <div className="float-right flex flex-col">
                            <button
                                onClick={() => {
                                    let link =
                                        location.protocol +
                                        "//" +
                                        location.host +
                                        "/post/" +
                                        place.split("Post")[0] +
                                        "/" +
                                        postdata.id;
                                    navigator.clipboard.writeText(link);
                                    alerts.info("Copied to clipboard");
                                }}
                            >
                                Share
                            </button>
                            {id != loggedInId && place == "normalPost"  && fromAdmin==undefined? (
                                <ReportButton
                                    fromWhere={place}
                                    setterReportedByUser={setterReportedByUser}
                                    outsideID={postdata.id}
                                />
                            ) : ((place != "normalPost" && fromAdmin==undefined)?(
                                <ReportButton
                                    fromWhere={place}
                                    setterReportedByUser={setterReportedByUser}
                                    outsideID={postdata.id}
                                />
                            ):(
                                null
                            ))}
                </div>}
                <div className="w-full px-10 py-8">
                    <section
                        className="w-full"
                        style={{ whiteSpace: "pre-wrap" }}
                    >
                        {postdata.text}
                    </section>
                    {postdata.isFile ? (
                        <div>
                            <div className="w-full text-center pt-5">
                                <Carousel
                                    interval={6000}
                                    autoPlay={autoPlayCarusel}
                                    infiniteLoop
                                    showArrows={true}
                                    className="inline-block w-4/5"
                                    emulateTouch={true}
                                    showStatus={false}
                                    useKeyboardArrows={true}
                                    showThumbs={false}
                                >
                                    {postdata.files.map((file) => {
                                        return (
                                            <div key={file.id}>
                                                {file.imageURI.endsWith(
                                                    ".mp4"
                                                ) ||
                                                file.imageURI.endsWith(
                                                    ".ogv"
                                                ) ||
                                                file.imageURI.endsWith(
                                                    ".ogg"
                                                ) ? (
                                                    <div>
                                                        {fromAdmin != true ? (
                                                            <ReportButton
                                                                fromWhere={
                                                                    place +
                                                                    "Image"
                                                                }
                                                                setterReportedByUser={
                                                                    setterReportedByUser
                                                                }
                                                                outsideID={
                                                                    postdata.id
                                                                }
                                                            />
                                                        ) : null}
                                                        <video
                                                            style={{
                                                                pointerEvents:
                                                                    "all",
                                                            }}
                                                            className={
                                                                bigger
                                                                    ? "max-h-96 object-contain"
                                                                    : "max-h-64 object-contain"
                                                            }
                                                            controls
                                                        >
                                                            <source
                                                                src={
                                                                    file.imageURI
                                                                }
                                                                style={{
                                                                    pointerEvents:
                                                                        "all",
                                                                }}
                                                            />
                                                            Your browser does
                                                            not support the
                                                            video tag.
                                                        </video>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {fromAdmin != true ? (
                                                            <ReportButton
                                                                fromWhere={
                                                                    place +
                                                                    "Image"
                                                                }
                                                                setterReportedByUser={
                                                                    setterReportedByUser
                                                                }
                                                                outsideID={
                                                                    postdata.id
                                                                }
                                                            />
                                                        ) : null}
                                                        <img
                                                            style={{
                                                                pointerEvents:
                                                                    "all",
                                                            }}
                                                            alt="Post image"
                                                            src={file.imageURI}
                                                            className={
                                                                bigger
                                                                    ? "max-h-96 object-contain"
                                                                    : "max-h-64 object-contain"
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </Carousel>
                            </div>
                        </div>
                    ) : null}
                    <section className="w-full my-4">
                        {loggedInId > 0 ? (
                            <div>
                                <Popup
                                    trigger={
                                        <div className="w-full text-center">
                                            Do you want to share your opinion?{" "}
                                            <button className="button">
                                                {" "}
                                                Click here!{" "}
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
                                                Add New Comment{" "}
                                            </div>
                                            <div className="content text-center">
                                                <form onSubmit={addnewComment}>
                                                    <section className="w-full">
                                                        <textarea
                                                            rows="15"
                                                            placeholder="Description"
                                                            autoComplete="off"
                                                            maxLength="3000"
                                                            value={newComments}
                                                            onChange={(e) =>
                                                                setNewComments(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        />
                                                    </section>
                                                    <button
                                                        type="submit"
                                                        className="w-fit"
                                                    >
                                                        Upload New Comment
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </Popup>
                            </div>
                        ) : null}
                        {postdata.isFile ? (
                            <div>
                                {postdata.files.length >= 1 ? (
                                    <button
                                        className={
                                            postdata.files.length >= 1
                                                ? "w-fit mr-5"
                                                : "w-fit float-left mr-5"
                                        }
                                        onClick={() => setBigger(!bigger)}
                                    >
                                        {bigger
                                            ? "Set Images Smaller"
                                            : "Set Images Bigger"}
                                    </button>
                                ) : null}
                                {postdata.files.length > 1 ? (
                                    <button
                                        className="w-fit mr-5"
                                        onClick={() =>
                                            setAutoPlayCarusel(!autoPlayCarusel)
                                        }
                                    >
                                        {autoPlayCarusel
                                            ? "Stop auto play"
                                            : "Start auto play"}
                                    </button>
                                ) : null}
                            </div>
                        ) : null}
                    </section>
                    {loggedInId > 0 && fromAdmin != true ? (
                        <Reactions
                            place={place}
                            data={postdata}
                            loggedInId={loggedInId}
                            where={"Post"}
                        />
                    ) : null}
                    <section className="w-full my-4">
                        {typeof Comments === "undefined" ||
                        Comments.length == 0 ? null : (
                            <div>
                                <button
                                    className="w-fit"
                                    onClick={() =>
                                        setShowComments(!showComments)
                                    }
                                >
                                    {showComments
                                        ? "Hide Comments"
                                        : "Show Comments"}
                                </button>
                            </div>
                        )}
                    </section>

                    {!showComments || fromAdmin == true ? null : (
                        <section
                            className="w-full h-fit max-h-96 overflow-y-auto"
                            key={Comments.length}
                        >
                            {Comments.map((item) => {
                                return (
                                    <Comment
                                        key={item.id}
                                        data={item}
                                        refreshFunc={refresh}
                                        place={place}
                                    />
                                );
                            })}
                        </section>
                    )}
                </div>
            </div>
        </div>
    ) : (reportedByUser)?null:(
        <div>
            <h1 className="w-full text-2xl text-center pt-8">Loading...</h1>
            <Loading />
        </div>
    );
}

export default Post;
