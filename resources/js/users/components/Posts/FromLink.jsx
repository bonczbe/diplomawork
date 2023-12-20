import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Post from "./Post";
import Loading from "../../../animation/Loading";

function FromLink() {
    const loggedInID = useSelector((state) => state.user.id);
    const [data, setData] = useState();
    let { place, id } = useParams();
    const navigate = useNavigate();
    place = place + "Post";
    useEffect(() => {
        if (loggedInID < 1) navigate("/unauthorized");
        switch (place) {
            case "normalPost":
                axios
                    .get("/api/post/" + id)
                    .then((res) => {
                        setData(res.data);
                    })
                    .catch((err) => {
                        if (
                            err.message == "Request failed with status code 404"
                        ) {
                            navigate("/404");
                        }
                    });
                break;
            case "pagePost":
                axios
                    .get("/api/pagepost/" + id)
                    .then((res) => {
                        setData(res.data);
                    })
                    .catch((err) => {
                        if (
                            err.message == "Request failed with status code 404"
                        ) {
                            navigate("/404");
                        }
                    });
                break;
            case "groupPost":
                axios
                    .get("/api/group/fromPost/" + id + "/" + loggedInID)
                    .then((res) => {
                        if (
                            (res.data.isPrivate === true && res.data.canSee) ||
                            res.data.isPrivate === false
                        ) {
                            axios
                                .get("/api/grouppost/" + id)
                                .then((response) => {
                                    setData(response.data);
                                })
                                .catch((err) => {
                                    if (
                                        err.message ==
                                        "Request failed with status code 404"
                                    ) {
                                        navigate("/404");
                                    }
                                });
                        }
                    })
                    .catch((err) => {
                        if (
                            err.message == "Request failed with status code 404"
                        ) {
                            navigate("/404");
                        }
                    });
                break;
            default:
                navigate("/404");
                break;
        }
    }, [place, id]);
    return data ? (
        <Post key={data.id} postdata={data} id={data.userID} place={place} />
    ) : (
        <div>
            <h1 className="w-full text-2xl text-center pt-8">Loading...</h1>
            <Loading />
        </div>
    );
}

export default FromLink;
