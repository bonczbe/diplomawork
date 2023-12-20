import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAlert } from "react-alert";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Member from "../UseMoreFromMOreComponents/Member";
import Loading from "../../../animation/Loading";

function BlockedUsers() {
    const alerts = useAlert();
    const navigate = useNavigate();
    const loggedInID = useSelector((state) => state.user.id);
    const [blockedList, setBlockedList] = useState([]);
    const [searched, setSearched] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");

    useEffect(() => {
        if (loggedInID > 0) {
            axios
                .get("/api/relations/blockeds/" + loggedInID)
                .then((res) => {
                    setBlockedList(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [loggedInID]);

    useEffect(() => {
        if (name !== "") {
            const timeOutId = setTimeout(() => {
                setSearched(
                    blockedList.filter((user) => user.name.indexOf(name) == 0)
                );
            }, 500);
            return () => clearTimeout(timeOutId);
        } else {
            setSearched([]);
        }
    }, [name]);

    const unBlock = (relID) => {
        console.log("Hahaha noti noti you teasing me!");
        axios
            .delete("/api/relations/delete/" + relID)
            .then(() => {
                alerts.success("User unblocked!");
                setSearched(searched.filter((user) => user.id != relID));
                setBlockedList(
                    blockedList.filter(
                        (stillBlocked) => stillBlocked.id != relID
                    )
                );
            })
            .catch((err) => {
                alerts.error("Something went wrong");
                console.log(err);
            });
    };

    return !loading ? (
        <div className="w-full h-full">
            <h1>Blocked Users</h1>
            {blockedList.length > 0 ? (
                <div className="w-full h-full">
                    <div className="w-full">
                        <label className="pr-3">Search by Name</label>
                        <input
                            type="text"
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                        />
                        {searched.length > 0 && name != "" ? (
                            <div className="w-full leading-10">
                                {searched.map((user) => {
                                    return (
                                        <div key={user.id}>
                                            <Link to={"/users/" + user.tag}>
                                                <img
                                                    src={user.profilePicURI}
                                                    className=" h-10 w-fit float-left pr-3"
                                                    alt="Profil Picture"
                                                />
                                                <span className="leading-10">
                                                    {user.name +
                                                        "  @" +
                                                        user.tag}
                                                </span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    unBlock(user.id);
                                                }}
                                                className="pl-3"
                                            >
                                                UnBlock
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="leading-10">&nbsp;</div>
                        )}
                    </div>
                    {blockedList.map((user) => {
                        return (
                            <div key={user.id}>
                                <Member
                                    member={
                                        user.user1ID == loggedInID
                                            ? user.user2ID
                                            : user.user1ID
                                    }
                                    userID={loggedInID}
                                    doNotSort={true}
                                />
                                <button
                                    className="pl-3 leading-10"
                                    onClick={() => {
                                        unBlock(user.id);
                                    }}
                                >
                                    Unblock
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div
                    className="w-full text-center"
                    style={{ fontSize: "x-large" }}
                >
                    There is no Blocked user
                </div>
            )}
        </div>
    ) : (
        <div>
            <h1 className="w-full text-2xl text-center pt-8">Loading...</h1>
            <Loading />
        </div>
    );
}

export default BlockedUsers;
