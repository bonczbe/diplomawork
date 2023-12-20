import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useAlert } from "react-alert";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "../../../../../sass/popup.css";
import Post from "./../../Posts/Post";
import Loading from "../../../../animation/Loading";

function Posts({ canPost, pageID, canEdit }) {
    const alerts = useAlert();
    const loggedInId = useSelector((state) => state.user.id);
    const [posts, setPosts] = useState();
    const [removedPost, setRemovedPost] = useState(0);
    const [newPosts, setNewPosts] = useState();
    const [newImages, setNewImages] = useState([]);
    const place = "pagePost";
/* This code block is using the `useEffect` hook to make an HTTP GET request to the server to retrieve
all the posts for a specific page, identified by `pageID`. The retrieved data is then stored in the
`posts` state using the `setPosts` function. The empty array `[]` passed as the second argument to
`useEffect` ensures that this effect only runs once, when the component mounts. */

    useEffect(() => {
        axios
            .get("/api/usersNeeded/pagePost/all/" + pageID)
            .then((response) => {
                setPosts(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

  /* This code block is using the `useEffect` hook to update the `posts` state whenever a post is
  removed. It filters out the removed post from the `posts` array using the `filter` method and sets
  the new array without the removed post using the `setPosts` function. The `removedPost` state is
  passed as the second argument to `useEffect`, which means that this effect will run whenever
  `removedPost` changes. */
    useEffect(() => {
        if (posts) {
            const newPosts = posts.filter((post) => post.id !== removedPost);
            setPosts(newPosts);
        }
    }, [removedPost]);
/**
 * The function "refresh" sets the state of a removed post in a React component.
 */

    const refresh = (postData) => {
        setRemovedPost(postData.id);
    };
/**
 * This function creates a new post with text and images (if any) and adds it to the page's posts list.
 */

    const newPost = (e) => {
        e.preventDefault();
        var isFile =
            newImages.length > 0 && newImages.length < 11 ? true : false;
        axios
            .post("/api/pagepost/new", {
                pageID: pageID,
                isFile: isFile,
                who: loggedInId,
                text: newPosts,
            })
            .then((response) => {
                if (isFile && response.data[0].id > 0) {
                    for (let i = 0; i < newImages.length; i++) {
                        let fd = new FormData();
                        fd.append("image", newImages[i]);
                        fd.append("postID", response.data[0].id);
                        axios
                            .post("/api/pagepostimage/new", fd, {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                },
                            })
                            .then(() => {
                                alerts.success("Post File Added");
                            })
                            .catch((err) => {
                                alerts.error(err.message);
                                console.log(err.message);
                            });
                    }
                    setNewImages([]);
                }
                const datas = [response.data[0], ...posts];
                setPosts(datas);
                setNewPosts("");
                if (!isFile) alerts.success("Post Added");
            })
            .catch((error) => {
                alerts.error(error.message);
                console.log(error.message);
            });
    };

    return (
        <div className="w-full pt-3">
            {canPost ? (
                <Popup
                    trigger={
                        <div className="w-full text-center">
                            Do you want to share any new about yourself?{" "}
                            <button className="button"> Click here! </button>
                        </div>
                    }
                    modal
                >
                    {(close) => (
                        <div className="modal">
                            <button className="close" onClick={close}>
                                &times;
                            </button>
                            <div className="header"> Add new Post </div>
                            <div className="content text-center">
                                <form onSubmit={newPost}>
                                    <section className="w-full">
                                        <textarea
                                            rows="15"
                                            placeholder="Description"
                                            autoComplete="off"
                                            maxLength="3000"
                                            value={newPosts}
                                            onChange={(e) =>
                                                setNewPosts(e.target.value)
                                            }
                                            className="w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        />
                                    </section>
                                    <section className="w-full">
                                        <input
                                            type="file"
                                            accept="image/*, video/mp4, video/ogv, video/ogg, video/webm"
                                            multiple
                                            value={newImages.pagetwodata}
                                            onChange={(e) =>
                                                setNewImages(
                                                    Array.prototype.slice.call(
                                                        e.target.files
                                                    )
                                                )
                                            }
                                            className="block mb-5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                        />
                                    </section>
                                    <button type="submit" className="w-fit">
                                        Upload New Post
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </Popup>
            ) : null}
            {typeof posts === "undefined" ? (
                <div>
                    <h1 className="w-full text-2xl text-center pt-8">
                        Loading...
                    </h1>
                    <Loading />
                </div>
            ) : (
                <div className="w-full" key={posts.length}>
                    {posts.map((post) => {
                        return (
                            <Post
                                key={post.id}
                                postdata={post}
                                id={pageID}
                                place={place}
                                functionRemove={refresh}
                                canPost={canPost}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Posts;
