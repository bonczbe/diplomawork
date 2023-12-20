import React, { useState, useEffect } from "react";
import Members from "./Members";
import About from "../About";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "../../../../../sass/popup.css";
import ReportButton from "../../UseMoreFromMOreComponents/ReportButton";
import Loading from "../../../../animation/Loading";
import { useAlert } from "react-alert";

function Event() {
    const [canEdit, setCanEdit] = useState(false);
    const [role, setRole] = useState(2);
    let { name, eventId } = useParams();
    var loggedInID = useSelector((state) => state.user.id);
    const [eventData, setEventData] = useState(undefined);
    const [relationData, setRelationData] = useState();
    const [relation, setRelation] = useState();
    const [isOwner, setIsOwner] = useState(false);
    const ProfSize = 120;
    const bordRadSize = 20;
    const navigate = useNavigate();
    const [reportedByUser, setReportedByUser] = useState(false);
    const [reportedByUserprof, setReportedByUserProf] = useState(false);
    const alerts = useAlert()
    /**
     * This is a function that sets the value of a state variable called ReportedByUser.
     */

    const setterReportedByUser = (fromcalled) => {
        setReportedByUser(fromcalled);
    };
    /**
     * This function sets the value of a variable called "reportedByUserProf" to the value passed as an
     * argument.
     */
    const setterReportedByUserProf = (fromcalled) => {
        setReportedByUserProf(fromcalled);
    };

    /* The above code is using the useEffect hook in a React component to make several API calls using
    the axios library. It is fetching data related to an event with a specific ID and setting the
    state of the component with the retrieved data. It also checks if the logged-in user is the
    owner of the event or has any relation to the event and sets the state accordingly. The
    useEffect hook is triggered whenever the "name" or "eventId" variables change. */
    useEffect(() => {
        axios
            .get("/api/usersNeeded/event/" + eventId)
            .then((res) => {
                if (res.data) {
                    setEventData(res.data);
                    if (loggedInID > 0)
                        axios
                            .get(
                                "/api/eventshelper/isOwner/" +
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
                    if (loggedInID > 0)
                        axios
                            .get(
                                "/api/eventshelper/relation/" +
                                res.data.id +
                                "/" +
                                loggedInID
                            )
                            .then((response) => {
                                setRelation(response.data);
                            })
                            .catch((error) => { });
                } else {
                    navigate("/404");
                }
            })
            .catch((err) => {
                if (err.message.includes('500') || err.message.includes('404')) navigate('/404')
                else console.log(err)
                console.log(err);
            });
    }, [name, eventId]);

    /* The above code is a React useEffect hook that runs when the component mounts or when the
    dependencies (eventData and loggedInID) change. */
    useEffect(() => {
        if (eventData && eventData.editable) {
            eventData.editable.map((item) => {
                if (
                    typeof item.userID !== "undefined" &&
                    item.userID == loggedInID
                ) {
                    setCanEdit(true);
                }
            });
        }
        if (loggedInID > 0 && eventData) {
            axios
                .get(
                    "/api/eventshelper/liked/" + eventData.id + "/" + loggedInID
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
    }, [eventData, loggedInID]);

    /**
     * This function handles the addition or update of a user's role in an event and updates the
     * event's member count accordingly.
     */
    const handleMember = (type) => {
        if (
            relationData.type == 0 &&
            isOwner == false &&
            eventData &&
            loggedInID > 0
        ) {
            axios
                .post("/api/eventshelper/new", {
                    userID: loggedInID,
                    eventID: eventData.id,
                    role: type+1,
                })
                .then((res) => {
                    alerts.success("You added to the lists!")
                })
                .catch((err) => {
                    console.log(err);
                });
        } else if (isOwner == false && eventData && loggedInID > 0) {
            axios
                .put("/api/eventshelper/update/" + eventData.id, {
                    eventID: eventData.id,
                    userID: loggedInID,
                    role: type + 1,
                })
                .then((res) => {
                    setRelationData({
                        ...relationData,
                        id: relationData.id,
                    });
                    let helper = {
                        ...eventData,
                    };
                    switch (type + 1) {
                        case 2:
                            helper.willBe = eventData.willBe + 1;
                            helper = decrementMember(helper);
                            break;
                        case 3:
                            helper.mightBe = eventData.mightBe + 1;
                            helper = decrementMember(helper);
                            break;
                        default:
                            helper.wont = eventData.wont + 1;
                            helper = decrementMember(helper);
                            break;
                    }
                    setEventData(helper);
                    setRelation(type + 1);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };
    /**
     * The function decrements a member based on their relation type.
     * @returns The function `decrementMember` is returning the `helper` object with updated values
     * based on the `switch` statement.
     */
    const decrementMember = (helper) => {
        switch (relation) {
            case 2:
                helper.willBe = eventData.willBe - 1;
                break;
            case 3:
                helper.mightBe = eventData.mightBe - 1;
                break;
            default:
                helper.wont = eventData.wont - 1;
                break;
        }
        return helper;
    };

    return eventData == undefined ? (
        <div className="w-full h-full" key={name + ":" + eventId}>
            <h1 className="w-full text-2xl text-center pt-8">Loading...</h1>
            <Loading />
        </div>
    ) : loggedInID > 0 ? (
        <div className="w-full h-full" key={name + ":" + eventId}>
            <div className="Background">
                <Popup
                    trigger={
                        <div className="w-full">
                            {reportedByUser == false ? (
                                <img
                                    src={eventData.WallpaperURI.WallPaperPicURI}
                                    alt={eventData.name + "Wallpaper"}
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
                                                eventData.WallpaperURI.id
                                            }
                                        />
                                        <img
                                            src={
                                                eventData.WallpaperURI
                                                    .WallPaperPicURI
                                            }
                                            alt={eventData.name + "Wallpaper"}
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
                                            eventData.ProfilePicURI
                                                .profilePicURI
                                        }
                                        alt={eventData.name + "Profile Picture"}
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
                                                    eventData.ProfilePicURI.id
                                                }
                                            />
                                            <img
                                                src={
                                                    eventData.ProfilePicURI
                                                        .profilePicURI
                                                }
                                                alt={
                                                    eventData.name +
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
                        {eventData.name}
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
                        {eventData.count} Member
                        {eventData.count > 1 ? "s" : null}
                    </span>
                </section>
                <div className="flex h-fit">
                <div className="w-10/12">
                    <About type={"event"} data={eventData} />
                </div>
                    <div key={relationData} className="item flex flex-col h-fit w-2/12">
                        {canEdit ? (
                            <Link
                                to={"/events/settings/" + name + "/" + eventId}
                            >
                                Edit
                            </Link>
                        ) : null}
                        {loggedInID > 0 &&
                            relationData &&
                            relationData.type !== 4 ? (
                            isOwner ? (
                                <button disabled>Owner</button>
                            ) : relationData.type === 1 ? (
                                <div className="w-full">
                                    <div className="w-full">
                                        <button onClick={() => handleMember(2)}>
                                            Might be there
                                        </button>
                                    </div>
                                    <div className="w-full">
                                        <button onClick={() => handleMember(3)}>
                                            Won't be there
                                        </button>
                                    </div>
                                </div>
                            ) : relationData.type === 2 ? (
                                <div className="w-full">
                                    <div className="w-full">
                                        <button onClick={() => handleMember(1)}>
                                            Will be there
                                        </button>
                                    </div>
                                    <div className="w-full">
                                        <button onClick={() => handleMember(3)}>
                                            Won't be there
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <div className="w-full">
                                        <button onClick={() => handleMember(1)}>
                                            Will be there
                                        </button>
                                    </div>
                                    <div className="w-full">
                                        <button onClick={() => handleMember(2)}>
                                            Might be there
                                        </button>
                                    </div>

                                    {relationData.type === 0 ? (
                                        <div className="w-full">
                                            <button onClick={() => handleMember(3)}>
                                                Won't be there
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            )
                        ) : null}
                    </div>
                </div>
                <div className="max-h-full w-full overflow-y-auto">
                    <div
                        className="w-full pt-3"
                        style={{
                            WebkitColumnCount: 3,
                            MozColumnCount: 3,
                            columnCount: 3,
                            WebkitColumnWidth: "33%",
                            MozColumnWidth: "33%",
                            columnWidth: "33%",
                        }}
                    >
                        <div className="flex flex-col">
                            <button onClick={() => setRole(2)}>
                                Will be there {" ( " + eventData.willBe + " )"}
                            </button>
                        </div>
                        <div className="flex flex-col">
                            <button onClick={() => setRole(3)}>
                                Might be there{" "}
                                {" ( " + eventData.mightBe + " )"}
                            </button>
                        </div>
                        <div className="flex flex-col">
                            <button onClick={() => setRole(4)}>
                                Won't be there {" ( " + eventData.wont + " )"}
                            </button>
                        </div>
                    </div>
                    <Members
                        id={eventData.id}
                        loggedInID={loggedInID}
                        role={role}
                        refresh={relation}
                    />
                </div>
            </div>
        </div>
    ) : null;
}

export default Event;
