import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Followers from "./Followers";
import Posts from "./Posts";
import axios from "axios";
import { useSelector } from "react-redux";
import Media from "./Media";
import About from "../About";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "../../../../../sass/popup.css";
import ReportButton from "../../UseMoreFromMOreComponents/ReportButton";
import Loading from "../../../../animation/Loading";

function Page() {
    const loggedInID = useSelector((state) => state.user.id);
    let { name, pageID } = useParams();
    const [pageData, setPageData] = useState(undefined);
    const [liked, setLiked] = useState();
    const [canEdit, setCanEdit] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [canSee, setCanSee] = useState(0);
    const [viewFlow, setViewFlow] = useState(0);
    const ProfSize = 120;
    const bordRadSize = 20;
    const navigate = useNavigate();
    const [reportedByUser, setReportedByUser] = useState(false);
    const [reportedByUserprof, setReportedByUserProf] = useState(false);

   /**
    * This function sets the value of a state variable called "reportedByUser" to the value passed as
    * an argument.
    */
    const setterReportedByUser = (fromcalled) => {
        setReportedByUser(fromcalled);
    };
    /**
     * This function sets the value of a state variable called ReportedByUserProf.
     */
    
    const setterReportedByUserProf = (fromcalled) => {
        setReportedByUserProf(fromcalled);
    };

   /* The above code is using the useEffect hook in a React component to make an HTTP GET request to an
   API endpoint to retrieve data about a specific page. The page ID is passed as a parameter to the
   API endpoint. If the response data is not null, it sets the page data state variable to the
   response data. If the user is logged in, it also makes another HTTP GET request to check if the
   logged-in user is the owner of the page. The isOwner state variable is set based on the response
   data. If the response data is null, it navigates to a 404 page. */
    useEffect(() => {
        axios
            .get("/api/usersNeeded/page/id/" + pageID)
            .then((res) => {
                if (res.data) {
                    setPageData(res.data);
                    if (loggedInID > 0)
                        axios
                            .get(
                                "/api/pagehelper/isOwner/" +
                                    res.data.id +
                                    "/" +
                                    loggedInID
                            )
                            .then((response) => {
                                setIsOwner(response.data);
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                } else {
                    navigate("/404");
                }
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, [name, pageID]);
/* The above code is using the `useEffect` hook in a React component to perform some actions when the
`pageData` or `loggedInID` variables change. */

    useEffect(() => {
        if (loggedInID > 0 && pageData && pageData.editable) {
            pageData.editable.map((item) => {
                if (
                    typeof item.userID !== "undefined" &&
                    item.userID === loggedInID
                ) {
                    setCanEdit(true);
                }
            });
        } else {
            setCanEdit(false);
        }
        if (loggedInID > 0 && pageData) {
            axios
                .get("/api/pagehelper/liked/" + pageData.id + "/" + loggedInID)
                .then((res) => {
                    setCanSee(res.data.type);
                    setLiked(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            setLiked();
        }
    }, [pageData, loggedInID]);
/**
 * The function `renderViewFlow` returns a React component based on the value of the `param` parameter.
 * @returns The function `renderViewFlow` returns a React component based on the value of the `param`
 * parameter. If `param` is equal to 1, it returns a `Media` component with `pageID` and `key` props.
 * If `param` is equal to 2, it returns a `Followers` component with `id`, `loggedInID`, and `key`
 */

    const renderViewFlow = (param) => {
        switch (param) {
            case 1:
                return <Media pageID={pageData.id} key={pageData.id} />;
            case 2:
                return (
                    <Followers
                        id={pageData.id}
                        loggedInID={loggedInID}
                        key={pageData.id}
                    />
                );
            default:
                return (
                    <Posts
                        canPost={canEdit}
                        pageID={pageData.id}
                        canEdit={canEdit}
                        key={pageData.id}
                    />
                );
        }
    };
/**
 * The function handles liking and unliking a page by sending requests to the server and updating the
 * state accordingly.
 */

    const handleLike = () => {
        if (liked.type == 1 && isOwner == false && pageData) {
            axios
                .delete("/api/pagehelper/delete/" + liked.id)
                .then((res) => {
                    setLiked({
                        id: 0,
                        type: 0,
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        } else if (liked.type == 0 && pageData) {
            axios
                .post("/api/pagehelper/new/", {
                    userID: loggedInID,
                    pageID: pageData.id,
                    rank: 1,
                })
                .then((res) => {
                    if (res.data && res.data.id) {
                        setLiked({
                            id: res.data.id,
                            type: 1,
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    return pageData == undefined ? (
        <div>
            <h1 className="w-full text-2xl text-center pt-8" key={name+":"+ pageID}>Loading...</h1>
            <Loading />
        </div>
    ) : typeof relationData === "undefined" || relationData.type !== 2 ? (
        <div className="w-full h-full" key={name+":"+ pageID}>
            <div className="Background">
                <Popup
                    trigger={
                        <div className="w-full">
                            {reportedByUser == false ? (
                                <img
                                    src={pageData.WallpaperURI.WallPaperPicURI}
                                    alt={pageData.name + "Wallpaper"}
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
                                            outsideID={pageData.WallpaperURI.id}
                                        />
                                        <img
                                            src={
                                                pageData.WallpaperURI
                                                    .WallPaperPicURI
                                            }
                                            alt={pageData.name + "Wallpaper"}
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
                <section>
                    <Popup
                        trigger={
                            <div className="w-full">
                                {reportedByUser == false ? (
                                    <img
                                        src={
                                            pageData.ProfilePicURI.profilePicURI
                                        }
                                        alt={pageData.name + "Profile Picture"}
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
                                <button className="close" onClick={close}>
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
                                                    pageData.ProfilePicURI.id
                                                }
                                            />
                                            <img
                                                src={
                                                    pageData.ProfilePicURI
                                                        .profilePicURI
                                                }
                                                alt={
                                                    pageData.name +
                                                    "Profile Picture"
                                                }
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
                    <span
                        style={{
                            fontFamily: "cursive",
                            fontSize: "xx-large",
                            letterSpacing: "0.2em",
                            lineHeight: "1.3em",
                        }}
                    >
                        {pageData.name}
                    </span>
                    <span
                        className="pl-3"
                        style={{
                            fontFamily: "cursive",
                            fontSize: "large",
                            letterSpacing: "0.2em",
                            lineHeight: "1.3em",
                        }}
                    >
                        {pageData.count} Follower
                        {pageData.count > 1 ? "s" : null}
                    </span>
                </section>
                <div className="flex h-fit">
                    <About type={"page"} data={pageData} />
                    <div className="item flex flex-col h-fit">
                        <button
                            onClick={() => {
                                setViewFlow(0);
                            }}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => {
                                setViewFlow(1);
                            }}
                        >
                            Media
                        </button>
                        {loggedInID > 0 ? (
                            <button
                                onClick={() => {
                                    setViewFlow(2);
                                }}
                            >
                                Followers
                            </button>
                        ) : null}
                        {canEdit ? (
                            <Link to={"/pages/settings/" + name + "/" + pageID}>
                                Edit
                            </Link>
                        ) : null}
                        {loggedInID > 0 && liked ? (
                            <button
                                disabled={
                                    isOwner || liked.type === 2 ? true : false
                                }
                                onClick={() => handleLike()}
                            >
                                {liked.type > 0 && liked.type < 2
                                    ? isOwner == true
                                        ? "Owner"
                                        : "Dislike"
                                    : "Like"}
                            </button>
                        ) : null}
                    </div>
                </div>
                <div className="max-h-full w-full overflow-y-auto">
                    {canSee == 1 || canSee == 0
                        ? renderViewFlow(viewFlow)
                        : null}
                </div>
            </div>
        </div>
    ) : null;
}

export default Page;
