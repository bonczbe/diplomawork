import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import RenderDatas from "./RenderDatas";
import Loading from "../../../animation/Loading"

function UsersOwnHistories() {
    const loggedInID = useSelector((state) => state.user.id);
    const [savedHistories, setSavedHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCollectionID, setSelectedCollectionID] = useState(0);
    useEffect(() => {
        axios
            .get("/api/savedhistorygroup/all/thumb/" + loggedInID)
            .then((res) => {
                setSavedHistories(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [loggedInID]);

    const onClickButtonInHistory = (savedID) => {
        if (savedID != selectedCollectionID) {
            setSelectedCollectionID(savedID);
        } else {
            ResetSelected();
        }
    };
    const getActualData = () => {
        let helper = savedHistories.filter((saved) => {
            return saved.id == selectedCollectionID;
        });
        if (helper.length == 1) {
            return helper[0];
        }
        return null;
    };
    const ResetSelected = () => {
        setSelectedCollectionID(0);
    };
    const deleteFromList = (id) => {
        let helper = savedHistories.filter((saved) => {
            return saved.id != id;
        });
        setSavedHistories(helper);
        ResetSelected();
    };

    return savedHistories.length > 0 ? (
        <div className="w-full h-full">
            <div className="w-full overflow-x-scroll h-32 flex flex-row relative">
                {savedHistories.map((saved) => {
                    return (
                        <div className="w-20 h-28" key={saved.id}>
                            <button
                                onClick={() => {
                                    onClickButtonInHistory(saved.id);
                                }}
                                className={
                                    (selectedCollectionID == saved.id
                                        ? " bg-gradient-to-r from-purple-700 to-pink-700 "
                                        : " bg-gradient-to-r from-purple-500 to-pink-500 ") +
                                    "mx-3 border-2 border-neutral-800 h-20 w-16 rounded-xl justify-center items-center flex"
                                }
                            >
                                <img
                                    src={saved.profilePicURI}
                                    className="w-12 h-16 object-contain bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-neutral-800 rounded-lg "
                                />
                            </button>
                            <section className="w-20 truncate text-center px-3">
                                {saved.name}
                            </section>
                        </div>
                    );
                })}
            </div>
            {selectedCollectionID > 0 ? (
                <RenderDatas
                    actualID={selectedCollectionID}
                    actualData={getActualData()}
                    ResetSelected={ResetSelected}
                    deleteFromList={deleteFromList}
                />
            ) : null}
        </div>
    ) : !loading ? (
        <div className="w-full h-full text-center py-5">
            <h1 className="w-full">You don't have saved history!</h1>
            <h2 className="w-full">
                Go travel, be with friends or just go out for a fancy food
                place!
            </h2>
        </div>
    ) : (
        <div>
            <h1 className="w-full text-2xl">Loading...</h1>
            <Loading />
        </div>
    );
}

export default UsersOwnHistories;
