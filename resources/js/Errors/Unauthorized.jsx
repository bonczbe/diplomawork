import React from "react";

/**
 * This function returns a React component that displays an unauthorized error message and an image.
 * @returns A React component that displays an error message and an image for unauthorized access.
 */
function Unauthorized() {
    return (
        <div className="w-full h-full text-center">
            <div className="w-full text-5xl font-serif pt-10 pb-7">
                401 - Please log in!
            </div>
            <img
                src={"/images/Unauthorized.png"}
                alt={"Unauthorized"}
                className="inline-block h-3/4"
            />
        </div>
    );
}

export default Unauthorized;
