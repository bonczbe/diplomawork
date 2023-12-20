import React, { useState, useEffect } from "react";
import About from "../About";
import Media from "./Media";
import Members from "./Members";
import Posts from "./Posts";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "../../../../../sass/popup.css";
import ReportButton from "../../UseMoreFromMOreComponents/ReportButton";
import Loading from "../../../../animation/Loading";
import { useAlert } from "react-alert";

function Group() {
    const loggedInID = useSelector((state) => state.user.id);
    const [relationData, setRelationData] = useState();
    const [groupData, setGroupData] = useState(undefined);
    const [isOwner, setIsOwner] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [canPost, setCanPost] = useState(false);
    const [canSee, setCanSee] = useState(false);
    const [isPrivate, setIsPrivate] = useState(true);
    const [loading, setLoading] = useState(true);
    const [viewFlow, setViewFlow] = useState(0);
    let { name, groupId } = useParams();
    const ProfSize = 120;
    const bordRadSize = 20;
    const navigate = useNavigate();
    const [reportedByUser, setReportedByUser] = useState(false);
    const [reportedByUserprof, setReportedByUserProf] = useState(false);
    const alerts = useAlert()

   /**
    * This function sets the value of a state variable called "reportedByUser" to the value passed as
    * an argument.
    */
    const setterReportedByUser = (fromcalled) => {
        setReportedByUser(fromcalled);
    };/**
     * This function sets the value of a state variable called ReportedByUserProf.
     */
    
    const setterReportedByUserProf = (fromcalled) => {
        setReportedByUserProf(fromcalled);
    };

    /* The above code is using the useEffect hook in a React component to make an HTTP GET request to
    an API endpoint to retrieve data about a group. If the request is successful, the retrieved data
    is stored in the component's state using the setGroupData function. The code also checks if the
    logged-in user is the owner of the group by making another HTTP GET request to a different API
    endpoint. The result of this check is stored in the component's state using the setIsOwner
    function. If there is an error in the HTTP request, the code checks if the error message
    includes '500' or ' */
    useEffect(() => {
        axios
            .get("/api/usersNeeded/group/" + groupId)
            .then((res) => {
                if (res.data) {
                    setGroupData(res.data);
                    if (loggedInID > 0)
                        axios
                            .get(
                                "/api/groupmember/isOwner/" +
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
                if (err.message.includes('500')||err.message.includes('404'))navigate('/404')
                console.log(err);
            });
    }, [name, groupId]);

    /* The above code is a React useEffect hook that runs when the component mounts or when the
    dependencies (groupData and loggedInID) change. It checks if the user is logged in and if they
    have permission to edit the group. It also checks if the group is private or not. Additionally,
    it makes an API call to get the relation data between the logged-in user and the group. The
    relation data is then set using the setRelationData function. */
    useEffect(() => {
        if (loggedInID > 0 && groupData && groupData.editable) {
            groupData.editable.map((item) => {
                if (
                    typeof item.memberID !== "undefined" &&
                    item.memberID === loggedInID
                ) {
                    setCanEdit(true);
                }
            });
        }
        if (groupData && groupData.status !== true) {
            setIsPrivate(true);
        } else {
            setIsPrivate(false);
        }

        if (loggedInID > 0 && groupData) {
            axios
                .get(
                    "/api/groupmember/liked/" + groupData.id + "/" + loggedInID
                )
                .then((res) => {
                    setRelationData(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            setRelationData();
        }
    }, [groupData, loggedInID]);
/* The above code is using the `useEffect` hook in a React component to make two API calls using the
`axios` library. The first API call checks if the logged-in user can post in a specific group, and
the second API call checks if the logged-in user can see the content of the same group. The results
of these API calls are stored in the component's state variables `canPost` and `canSee`,
respectively. The `useEffect` hook is triggered whenever the `groupData` or `loggedInID` variables
change. */

    useEffect(() => {
        if (groupData && loggedInID > 0) {
            axios
                .get(
                    "/api/groupmember/canPost/" +
                        groupData.id +
                        "/" +
                        loggedInID
                )
                .then((res) => {
                    setCanPost(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        if (groupData && loggedInID > 0) {
            axios
                .get(
                    "/api/groupmember/canSee/" + groupData.id + "/" + loggedInID
                )
                .then((res) => {
                    setLoading(false);
                    setCanSee(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [groupData, loggedInID]);

   /**
    * This function handles adding or removing a member from a group using axios requests.
    */
    const handleMember = () => {
        if (relationData.type != 0 && isOwner == false && groupData) {
            axios
                .delete("/api/groupmember/delete/" + relationData.id)
                .then((res) => {
                    setRelationData({
                        id: 0,
                        type: 0,
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        } else if (relationData.type == 0 && groupData) {
            axios
                .post("/api/groupmember/new/", {
                    memberID: loggedInID,
                    groupID: groupData.id,
                    rank: 5,
                })
                .then((res) => {
                    if (res.data && res.data.id) {
                        alerts.info("An admin will check your request")
                        setRelationData({
                            id: res.data.id,
                            type: 2,
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

   /**
    * The function `renderViewFlow` returns a React component based on the value of the `param`
    * parameter.
    * @returns The function `renderViewFlow` returns a React component based on the value of the
    * `param` parameter. If `param` is equal to 1, it returns a `Media` component with `groupID` and
    * `key` props. If `param` is equal to 2, it returns a `Members` component with `id`, `loggedInID`,
    * and `key` props
    */
    const renderViewFlow = (param) => {
        switch (param) {
            case 1:
                return <Media groupID={groupData.id} key={groupData.id} />;
            case 2:
                return (
                    <Members
                        id={groupData.id}
                        loggedInID={loggedInID}
                        key={groupData.id+":"+canPost}
                    />
                );
            default:
                return (
                    <Posts
                        canEdit={canEdit}
                        canPost={canPost}
                        groupID={groupData.id}
                        key={groupData.id+":"+canPost}
                    />
                );
        }
    };

    return groupData == undefined && loading ? (
        <div className="w-full h-full"  key={name+":"+ groupId}>
            <h1 className="w-full text-2xl text-center pt-8">Loading...</h1>
            <Loading />
        </div>
    ) : typeof relationData == "undefined" || relationData.type != 3 ? (
        <div className="w-full h-full" key={name+":"+ groupId}>
            <div className="Background">
                <Popup
                    trigger={
                        <div className="w-full">
                            {reportedByUser == false ? (
                                <img
                                    src={groupData.WallpaperURI.WallPaperPicURI}
                                    alt={groupData.name + "Wallpaper"}
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
                                                groupData.WallpaperURI.id
                                            }
                                        />
                                        <img
                                            src={
                                                groupData.WallpaperURI
                                                    .WallPaperPicURI
                                            }
                                            alt={groupData.name + "Wallpaper"}
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

                {/* Kellene, hogy mikor a tulaj rá kattint tudja editelni, ha a sarokba kattint, ha pedig valaki rá kattint kinagyobbuljon */}
            </div>
            <div className="Important">
                <section>
                    <Popup
                        trigger={
                            <div className="w-full">
                                {reportedByUser == false ? (
                                    <img
                                        src={
                                            groupData.ProfilePicURI
                                                .profilePicURI
                                        }
                                        alt={groupData.name + "Profile Picture"}
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
                                                    groupData.ProfilePicURI.id
                                                }
                                            />
                                            <img
                                                src={
                                                    groupData.ProfilePicURI
                                                        .profilePicURI
                                                }
                                                alt={
                                                    groupData.name +
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

                    {/* Kellene, hogy mikor a tulaj rá kattint tudja editelni, ha a sarokba kattint, ha pedig valaki rá kattint kinagyobbuljon */}
                    <span
                        style={{
                            fontFamily: "cursive",
                            fontSize: "xx-large",
                            letterSpacing: "0.2em",
                            lineHeight: "1.3em",
                        }}
                    >
                        {groupData.name}
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
                        {groupData.count} Member
                        {groupData.count > 1 ? "s" : null}
                    </span>
                </section>
                <div className="flex h-fit">
                    <About type={"group"} data={groupData} />
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
                        {(isPrivate === true && canSee) ||
                        (isPrivate === false && canSee) ? (
                            <button
                                onClick={() => {
                                    setViewFlow(2);
                                }}
                            >
                                Members
                            </button>
                        ) : null}
                        {canEdit ? (
                            <Link
                                to={"/groups/settings/" + name + "/" + groupId}
                            >
                                Edit
                            </Link>
                        ) : null}
                        {loggedInID > 0 && relationData ? (
                            <button
                                disabled={
                                    (typeof relationData!="undefined")&&(isOwner || relationData.type === 3 || relationData.type ===6)
                                        ? true
                                        : false
                                }
                                onClick={() => handleMember()}
                            >
                                {relationData.type > 0 && relationData.type < 3
                                    ? isOwner == true
                                        ? "Owner"
                                        : "Leave"
                                    : ((relationData.type==6)?"Blocked":"Join")}
                            </button>
                        ) : null}
                    </div>
                </div>
                <div className="max-h-full w-full overflow-y-auto">
                    {(isPrivate === true && canSee) || isPrivate === false
                        ? renderViewFlow(viewFlow)
                        : null}
                </div>
            </div>
        </div>
    ) : null;
}

export default Group;
