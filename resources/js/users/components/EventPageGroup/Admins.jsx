import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Member from "../UseMoreFromMOreComponents/Member";
import { useAlert } from "react-alert";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../../animation/Loading";

function Admins({ spaceID, editType, place, ranks }) {
    const [admins, setAdmins] = useState([]);
    const loggedInID = useSelector((state) => state.user.id);
    const [loading, setLoading] = useState(true);
    const [tag, setTag] = useState("");
    const [newMember, setNewMember] = useState();
    const alerts = useAlert();
    const navigate = useNavigate();
    const routeHelp =
        place == "page"
            ? "pagehelper"
            : place == "group"
                ? "groupmember"
                : place == "event"
                    ? "eventshelper"
                    : "";
    /* This is a `useEffect` hook that is used to fetch the list of admins for a particular space (page,
    group, or event) and update the state variables `admins` and `loading` accordingly. It runs whenever
    there is a change in the `place`, `spaceID`, or `editType` variables. The `axios.get` method is used
    to make a GET request to the server API endpoint to fetch the list of admins. If the request is
    successful, the `setAdmins` method is used to update the `admins` state variable with the fetched
    data and `setLoading` is set to `false`. If there is an error, the user is redirected to the 404
    page and the error is logged to the console. */

    useEffect(() => {
        if (routeHelp != "") {
            axios
                .get("/api/" + routeHelp + "/admins/" + spaceID)
                .then((res) => {
                    setAdmins(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    navigate("/404");
                    console.log(err);
                });
        }
    }, [place, spaceID, editType]);
    /**
     * This function removes an admin from a list and sends a delete request to the server using axios.
     */
    const changeAdmin = (relID) => {
        if (routeHelp != "") {
            axios
                .delete("/api/" + routeHelp + "/delete/" + relID)
                .then(() => {
                    alerts.success("Admin successfully removed!");
                    setAdmins(admins.filter((removed) => removed.id != relID));
                })
                .catch((err) => {
                    alerts.error("Something went wrong");
                    console.log(err);
                });
        }
    };
    /* This is a `useEffect` hook that is used to fetch information about a user based on their tag and
    update the state variable `newMember` accordingly. It runs whenever there is a change in the
    `tag` variable. The `axios.get` method is used to make a GET request to the server API endpoint
    to fetch the user information. If the request is successful and the user is not already an
    admin, the `setNewMember` method is used to update the `newMember` state variable with the
    fetched data. If the user is already an admin, an info message is displayed using the
    `alerts.info` method and `setNewMember` is set to `undefined`. If there is an error,
    `setNewMember` is set to `undefined`. The `setTimeout` function is used to delay the API call by
    500 milliseconds to avoid making too many requests too quickly. The `clearTimeout` function is
    used to cancel the API call if the `tag` variable changes before the timeout is reached. */
    useEffect(() => {
        if (tag !== "") {
            const timeOutId = setTimeout(() => {
                axios
                    .get("/api/users/idFromTag/" + tag)
                    .then((res) => {
                        if (res.status === 200) {
                            let isNotMeMber = true;
                            admins.map((admin) => {
                                if (admin.userID == res.data) {
                                    isNotMeMber = false;
                                }
                            });
                            if (isNotMeMber) {
                                axios
                                    .get("/api/usersNeeded/" + res.data)
                                    .then((respone) => {
                                        setNewMember(respone.data);
                                    });
                            } else {
                                alerts.info("The user is an admin!");
                                setNewMember(undefined);
                            }
                        }
                    })
                    .catch((err) => {
                        setNewMember(undefined);
                    });
            }, 500);
            return () => clearTimeout(timeOutId);
        } else {
            setNewMember(undefined);
        }
    }, [tag]);

    /**
     * The function handles the submission of data to add a new admin to a page, group, or event using
     * axios and updates the state accordingly.
     */
    const handeSubmit = (e) => {
        e.preventDefault(undefined);
        let data = undefined;
        switch (place) {
            case "page":
                data = {
                    userID: newMember.id,
                    pageID: spaceID,
                    rank: 2,
                };
                break;
            case "group":
                data = {
                    memberID: newMember.id,
                    groupID: spaceID,
                    rank: 3,
                };
                break;
            case "event":
                data = {
                    userID: newMember.id,
                    eventID: spaceID,
                    role: 1,
                };
                break;
            default:
                break;
        }
        if (typeof data !== "undefined")
            axios
                .post("/api/" + routeHelp + "/new", data)
                .then((res) => {
                    alerts.success("New Admin Added!");
                    let newAdmin = {
                        userID: newMember.id,
                        id: res.data.id,
                        rank: place == "event" ? data.role : data.rank,
                    };
                    setAdmins([...admins, newAdmin]);
                    setNewMember(undefined);
                })
                .catch((err) => {
                    alerts.error("Something went wrong");
                    console.log(err);
                });
    };
    return (
        <div>
            <div>
                <form onSubmit={handeSubmit}>
                    <label className="pr-3">Tag of the User</label>
                    <input
                        type="text"
                        className=" text-gray-900"
                        placeholder="tag"
                        value={tag}
                        onChange={(e) => {
                            setTag(e.target.value);
                        }}
                    />
                    {typeof newMember != "undefined" ? (
                        <div className="w-full mt-2">
                            <Link to={"/users/" + newMember.tag}>
                                <img
                                    src={newMember.ProfilePicURI.profilePicURI}
                                    className=" h-10 w-auto float-left pr-3"
                                    alt="Profil Picture"
                                />
                                <span className="leading-10">
                                    {newMember.firstName + " "}
                                    {newMember.middleName != "null" ? (
                                        <span>{newMember.middleName} </span>
                                    ) : (
                                        ""
                                    )}
                                    {newMember.lastName}
                                </span>
                            </Link>
                            <button type="submit" className="ml-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                                Add new Admin
                            </button>
                        </div>
                    ) : (
                        <div className="leading-10">&nbsp;</div>
                    )}
                </form>
            </div>
            {admins.length > 0 ? (
                admins.map((admin) => {
                    return admin.rank != ranks.owner ? (
                        <div key={admin.userID} className="w-full flex pt-3">
                            <div className="w-10/12">
                                <Member
                                    member={admin.userID}
                                    userID={loggedInID}
                                    doNotSort={true}
                                />
                            </div>
                            <div className="w-2/12">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                    onClick={() => {
                                        changeAdmin(admin.id);
                                    }}
                                >
                                    Remove Admin
                                </button>

                            </div>
                        </div>
                    ) : null;
                })
            ) : loading === false ? (
                <div
                    className="w-full text-center"
                    style={{ fontSize: "x-large" }}
                >
                    There is no Admin
                </div>
            ) : (
                <div>
                    <h1 className="w-full text-2xl text-center pt-8">
                        Loading...
                    </h1>
                    <Loading />
                </div>
            )}
        </div>
    );
}

export default Admins;
