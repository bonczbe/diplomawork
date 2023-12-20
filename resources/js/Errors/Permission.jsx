import React from "react";
/* Defining a React functional component called `Permission` that returns a JSX element. The JSX
element is a div with a class name of "w-full h-full text-center" that contains a nested div with a
class name of "w-full text-5xl font-serif pt-10 pb-7" and an image with a source of
"/images/Permissiondenied.png" and an alt text of "Permission Denied". */

function Permission() {
    return (
        <div className="w-full h-full text-center">
            <div className="w-full text-5xl font-serif pt-10 pb-7">
                403 - Permission Denied
            </div>
            <img
                src={"/images/Permissiondenied.png"}
                alt={"Permission Denied"}
                className="inline-block h-3/4"
            />
        </div>
    );
}

export default Permission;
