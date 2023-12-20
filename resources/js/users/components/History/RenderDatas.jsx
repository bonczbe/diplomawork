import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import HighlightOffTwoToneIcon from "@mui/icons-material/HighlightOffTwoTone";
import Loading from "../../../animation/Loading";

function RenderDatas({ actualID, actualData, ResetSelected, deleteFromList }) {
    const [showImages, setShowImages] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [name, setName] = useState("");
    const [newProfile, setNewProfile] = useState(1);
    const [fromExist, setFromExist] = useState(0);
    const [existProfiles, setExistProfiles] = useState([]);
    const [images, setImages] = useState([]);
    const [onHoverImageId, setOnHOverImageID] = useState(0);

    const alerst = useAlert();
    useEffect(() => {
        if (actualData != null) {
            setName(actualData.name);
        }
        axios
            .get("/api/profilepics/all/index/historygroup/" + actualID)
            .then((res) => {
                setExistProfiles(res.data);
            })
            .catch((err) => {
                conosle.log(err);
            });
        axios
            .get("/api/savedhistorygroup/all/group/" + actualID)
            .then((res) => {
                console.log(res.data);
                setImages(res.data);
            })
            .catch((err) => {
                conosle.log(err);
            });
    }, [actualID]);
    const UpdateHistory = (e) => {
        e.preventDefault();
        axios
            .put("/api/savedhistorygroup/update/" + actualID, {
                name: actualData.name,
                profileID: fromExist,
            })
            .then(() => {
                alerst.success("Updated Collection");
                ResetSelected();
            })
            .catch((err) => {
                alerst.success("Update failed");
                console.log(err);
            });
    };
    const newProfileUpload = (e) => {
        e.preventDefault();
        let fd = new FormData();
        fd.append("image", newProfile);
        fd.append("place", "historygroup");
        fd.append("outsideID", actualID);
        axios
            .post("/api/profilepics/new", fd)
            .then((res) => {
                alerst.success("Picture uploaded successfully");
                setExistProfiles([res.data, ...existProfiles]);
            })
            .catch((err) => {
                alerst.success("Upload failed");
                conosle.log(err);
            });
    };
    const handlechange = (index) => {
        setFromExist(existProfiles[index].id);
    };
    const deleteProfile = () => {
        if (fromExist > 1) {
            axios
                .delete(
                    "/api/profilepics/delete/" +
                    fromExist +
                    "/historygroup/65134"
                )
                .then(() => {
                    alerst.success("Picture deleted successfully");
                    let helper = existProfiles.filter((profile) => {
                        return profile.id != fromExist;
                    });
                    setExistProfiles(helper);
                })
                .catch((err) => {
                    alerst.success("Something went wrong");
                    conosle.log(err);
                });
        } else {
            console.log("Mit csinálsz? Eltöröm a kezed!");
        }
    };
    const deleteCollection = () => {
        axios
            .delete("/api/savedhistorygroup/delete/" + actualID)
            .then(() => {
                alerst.success("Collection deleted successfully");
                deleteFromList(actualID);
            })
            .catch((err) => {
                alerst.success("Something went wrong");
                conosle.log(err);
            });
    };
    const isVideo = (data) => {
        let tag = "URI";
        return (
            data[tag].endsWith(".mp4") ||
            data[tag].endsWith(".ogv") ||
            data[tag].endsWith(".ogg")
        );
    };
    const deleteImageFromCollection = (historyID) => {
        let helper = images.filter((img) => {
            return img.id != historyID;
        });
        setImages(helper);
    };
    const deleteFromCollection = (helperID, GroupID, historyID) => {
        axios
            .delete(
                "/api/savedhistorygrouphelper/delete/" +
                historyID +
                "/" +
                GroupID
            )
            .then(() => {
                alerst.success("Image deleted successfully");
                deleteImageFromCollection(helperID);
            })
            .catch((err) => {
                alerst.success("Something went wrong");
                conosle.log(err);
            });
    };
    return (
        <div className="w-full h-full flex flex-col  items-center justify-center">
            <div className="flex justify-between w-full my-4">
                <button
                    onClick={() => {
                        setShowSettings(!showSettings);
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    {showSettings ? "Hide " : "Show "}Settings
                </button>
                <button
                    onClick={() => {
                        setShowImages(!showImages);
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    {showImages ? "Hide " : "Show "}Images
                </button>
            </div>
            {showSettings ? (
                <div className="item w-8/12">
                    <form onSubmit={UpdateHistory} className="w-full">
                        <section className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
                                Name:
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                maxLength={32}
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </section>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">
                                Change Profile Picture:
                            </label>
                            <Carousel
                                autoPlay={false}
                                swipeable
                                onChange={handlechange}
                            >
                                {existProfiles.map((file) => {
                                    return (
                                        <div key={file.id}>
                                            <img
                                                src={file.profilePicURI}
                                                className="max-h-36 object-contain"
                                            />
                                        </div>
                                    );
                                })}
                            </Carousel>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Update collection
                        </button>
                    </form>
                    <form onSubmit={newProfileUpload} className="flex flex-col items-center">
                        <label htmlFor="new-profile-picture" className="mb-2 font-bold">
                            New Profile Picture:
                        </label>
                        <input
                            id="new-profile-picture"
                            type="file"
                            accept="image/*"
                            className="border rounded py-2 px-3"
                            onChange={(e) => setNewProfile(e.target.files[0])}
                        />
                        <div className="w-full">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                            >
                                Upload New Profile Picture
                            </button>
                        </div>
                    </form>
                    <button
                        onClick={() => {
                            deleteProfile();
                        }}
                        className="bg-blue-500 m-3 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Delete Profile Picture
                    </button>
                    <button
                        onClick={() => {
                            deleteCollection();
                        }}
                        className="bg-blue-500 m-3 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Delete Collection
                    </button>
                </div>
            ) : null}
            <div className="w-full h-full">
                {(showImages) ? (
                    <div className="w-full h-full">
                        {images.length > 0 ? (
                            <div
                                className="w-full h-full"
                                style={{
                                    WebkitColumnCount: 3,
                                    MozColumnCount: 3,
                                    columnCount: 3,
                                    WebkitColumnWidth: "33%",
                                    MozColumnWidth: "33%",
                                    columnWidth: "33%",
                                }}
                            >
                                {images.map((data) => {
                                    return (
                                        <div
                                            className="py-2 block relative"
                                            key={data.historyID}
                                        >
                                            <div
                                                className=""
                                                onMouseLeave={() => {
                                                    setOnHOverImageID(0);
                                                }}
                                                onMouseEnter={() => {
                                                    setOnHOverImageID(
                                                        data.historyID
                                                    );
                                                }}
                                            >
                                                {onHoverImageId ==
                                                    data.historyID ? (
                                                    <button
                                                        className="absolute bg-white z-[101] rounded-full"
                                                        onClick={() => {
                                                            deleteFromCollection(
                                                                data.id,
                                                                data.GroupID,
                                                                data.historyID
                                                            );
                                                        }}
                                                    >
                                                        <HighlightOffTwoToneIcon />
                                                    </button>
                                                ) : null}
                                                {isVideo(data) ? (
                                                    <video
                                                        style={{
                                                            pointerEvents: "all",
                                                        }}
                                                        className={
                                                            "mw-full object-contain item"
                                                        }
                                                        controls
                                                    >
                                                        /
                                                        <source
                                                            src={data.URI}
                                                            style={{
                                                                pointerEvents:
                                                                    "all",
                                                            }}
                                                        />
                                                        Your browser does not
                                                        support the video tag.
                                                    </video>
                                                ) : (
                                                    <img
                                                        style={{
                                                            pointerEvents: "all",
                                                        }}
                                                        alt="Post image"
                                                        src={data.URI}
                                                        className={
                                                            "w-full object-contain item"
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="w-full text-center">
                                <h1 className="w-full">There isn't any history</h1>
                            </div>
                        )}
                    </div>

                ) : null}

            </div>

        </div>
    );
}

export default RenderDatas;
