import React from "react";

/* This is a functional component in React that returns a JSX element. The element contains a div with
a class name of "w-full h-full text-center" that has a child div with a class name of "w-full
text-5xl font-serif pt-10 pb-7" and an image with a source of "/images/no-found.gif" and an alt text
of "not found". This component is likely used to display a 404 error page in a React application. */
function NotFound() {
    return (
        <div className="w-full h-full text-center">
            <div className="w-full text-5xl font-serif pt-10 pb-7">
                404 - NOT FOUND
            </div>
            <img
                src={"/images/no-found.gif"}
                alt={"not found"}
                className="inline-block h-3/4"
            />
        </div>
    );
}

export default NotFound;
