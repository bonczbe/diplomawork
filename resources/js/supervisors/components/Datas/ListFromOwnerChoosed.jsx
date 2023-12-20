import React from "react";
import Loading from "../../../animation/Loading";
/**
 * This is a React component that renders a list of items based on the type of list chosen by the
 * owner, with different information displayed for adminReports and checkedReports.
 * @returns A React component that displays a list of items based on the input list and type. If the
 * list is empty, it displays a message saying there are no data. If the list is still loading, it
 * displays a message saying it is loading. Otherwise, it maps through the list and displays the
 * relevant information for each item.
 */

function ListFromOwnerChoosed({ list, type }) {
    //0 = adminReports, 1= checkedReports

    return (
        <div className="w-full h-full">
            {list.length < 1 ? (
                <div className="w-full h-full flex justify-center items-center">
                    <h1 className="text-4xl font-bold text-gray-500">
                        There are no data
                    </h1>
                </div>
            ) : list[0] == -1 ? (
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <h1 className="w-full text-2xl text-center pt-8">Loading...</h1>
                    <Loading />
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                    {list.map((item) => {
                        return (
                            <div key={item.id} className=" flex flex-row mt-3 text-center">
                                <span className="mr-4">
                                    {(type == "adminReports") ? item.tag : item.admin.tag}
                                </span>
                                {(type == "adminReports")
                                        ?<span className="mr-4">{item.firstName + " " + (item.middleName != null ? item.middleName + " " : "") + item.lastName}</span>
                                    :null
                                }
                                <span>
                                    {(type == "adminReports")
                                        ? 'Number of the approved reports: ' + item.allchecked
                                        : 'Number of the reports before approved: ' + item.num_reports
                                    }
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ListFromOwnerChoosed;
