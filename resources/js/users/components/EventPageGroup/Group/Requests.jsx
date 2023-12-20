import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useAlert } from "react-alert";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../../../animation/Loading";
import Member from "../../UseMoreFromMOreComponents/Member";

function Requests({ spaceID, editType, ranks }) {
    const [requests, setRequests] = useState([]);
    const loggedInID = useSelector((state) => state.user.id);
    const [loading, setLoading] = useState(true);
    const alerts = useAlert();
    useEffect(() => {
        if (loggedInID>0) {
            axios
                .get("/api/groupmember/requests/" + spaceID)
                .then((res) => {
                    setRequests(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    navigate("/404");
                    console.log(err);
                });
        }
    }, [spaceID, editType]);
    
    
    const changeAdmin = (relID,isAccept) => {
        if(isAccept){
            axios
                .put("/api/groupmember/update/" + relID,{
                    rank:1,
                    groupID:spaceID
                })
                .then(() => {
                    alerts.success("Request successfully accepted!");
                    setRequests(requests.filter((removed) => removed.id != relID));
                })
                .catch((err) => {
                    alerts.error("Something went wrong");
                    console.log(err);
                });
        }else{
            axios
                .delete("/api/groupmember/delete/" + relID)
                .then(() => {
                    alerts.success("Request successfully declined!");
                    setRequests(requests.filter((removed) => removed.id != relID));
                })
                .catch((err) => {
                    alerts.error("Something went wrong");
                    console.log(err);
                });
        }
    };
    return (

        <div>
            {requests.length > 0 ? (
                requests.map((admin) => {
                    return  <div key={admin.id} className="w-full flex pt-3">
                           
                            <Member
                                member={admin.memberID}
                                userID={loggedInID}
                                doNotSort={true}
                            />
                            <button
                                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-3 rounded"
                                onClick={() => {
                                    changeAdmin(admin.id,true);
                                }}
                            >
                                Accept
                            </button>
                            <button
                                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => {
                                    changeAdmin(admin.id,false);
                                }}
                            >
                                Decline
                            </button>
                        </div>
                })
            ) : loading === false ? (
                <div
                    className="w-full text-center"
                    style={{ fontSize: "x-large" }}
                >
                    There is no any requests
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
    )
}

export default Requests