import axios from "axios";
import React, { useState, useEffect } from "react";
import Relation from "./Relation";
import Loading from "../../../animation/Loading";

function Relations({ id, loggedInID }) {
    const [relations, setRelations] = useState([]);
    const [removedRelation, setRemovedRelation] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("/api/relations/all/fromUser/" + id)
            .then((response) => {
                setRelations(response.data);
                setLoading(false);
            })
            .catch((error) => console.log(error));
    }, [loggedInID]);

    useEffect(() => {
        if (relations) {
            const newRelations = relations.filter(
                (relation) => relation.id !== removedRelation
            );
            setRelations(newRelations);
        }
    }, [removedRelation]);

    const removeRelation = (relationData) => {
        setRemovedRelation(relationData.id);
    };
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
            {relations.length > 0 ? (
                relations.map((relation) => {
                    return (
                        <Relation
                            key={
                                "" +
                                relation.type +
                                relation.user1ID +
                                relation.user2ID
                            }
                            data={relation}
                            userID={id}
                            removeRelation={removeRelation}
                        />
                    );
                })
            ) : loading === false ? (
                <div
                    className="w-full text-center"
                    style={{ fontSize: "x-large" }}
                >
                    There is no relation
                </div>
            ) : (
                <div>
                    <h1 className="w-full text-2xl text-center pt-8">Loading...</h1>
                    <Loading />
                </div>
            )}
        </div>
    );
}

export default Relations;
