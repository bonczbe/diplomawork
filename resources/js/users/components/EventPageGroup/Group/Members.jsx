import axios from "axios";
import React, { useState, useEffect } from "react";
import Member from "../../UseMoreFromMOreComponents/Member";
import Loading from "../../../../animation/Loading";

export function Members({ id, loggedInID }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    /* `useEffect` is a hook in React that allows you to perform side effects in functional components.
    In this code, `useEffect` is used to make an HTTP GET request to the server to fetch the members
    of a group. The `axios.get` method is used to make the request, and the response data is stored
    in the `members` state variable using the `setMembers` function. The `setLoading` function is
    also called to set the `loading` state variable to `false` once the data has been fetched. */
    useEffect(() => {
        axios
            .get("/api/groupmember/members/" + id)
            .then((response) => {
                setMembers(response.data);
                setLoading(false);
            })
            .catch((error) => console.log(error));
    }, [loggedInID]);
    return (
        <div
            className="w-full h-full pt-3"
            style={{
                WebkitColumnCount: 1,
                MozColumnCount: 1,
                columnCount: 1,
                WebkitColumnWidth: "100%",
                MozColumnWidth: "100%",
                columnWidth: "100%",
            }}
        >
            {members.length > 0 ? (
                members.map((member) => {
                    return (
                        <Member
                            key={member.memberID}
                            member={member.memberID}
                            userID={loggedInID}
                            connectionID={member.id}
                        />
                    );
                })
            ) : loading === false ? (
                <div
                    className="w-full text-center"
                    style={{ fontSize: "x-large" }}
                >
                    There is no Follower
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

export default Members;
