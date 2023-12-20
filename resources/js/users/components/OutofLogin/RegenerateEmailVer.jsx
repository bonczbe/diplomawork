import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { useAlert } from "react-alert";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function RegenerateEmailVer() {
    const [email, setEmail] = useState("");
    const alerts = useAlert();
    const loggedInID = useSelector((state) => state.user.id);
    const navigate = useNavigate()
    useEffect(() => {
        if (loggedInID > 0) navigate("/home");
    }, [loggedInID]);
    const regenerate = (e) => {
        e.preventDefault();
        if (
            email.match(
                /^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/
            )
        ) {
            alerts.info("Email is generating!")
            axios
                .post("/api/auth/user/newVerify", {
                    email: email
                })
                .then(() => {
                    alerts.success("Email verification resent!");
                    setUserEmail("")
                })
                .catch((err) => {
                    console.log(err);
                    alerts.error("Something went wrong!");
                });
        } else {

            alerts.error("Your password does not match with the requirements")
        }
    };
    

    return (

        <div className="w-full h-full flex justify-center items-center">
            <form onSubmit={regenerate} className=" p-6 rounded-lg shadow-md">
                <h1 className="text-center mb-4 text-2xl font-bold">
                    Regenerate Email Verification
                </h1>
                <label htmlFor="email" className="block mb-2 font-medium">
                    Email:
                </label>
                <input
                    className={`w-full p-2 text-gray-900 rounded-lg border ${email.match(
                        /^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/
                    )
                            ? "border-gray-400 focus:border-secondary-color"
                            : "border-red-500 focus:border-red-700"
                        } focus:outline-none`}
                    type="text"
                    placeholder="Email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    required
                    id="email"
                    name="email"
                />
                <input
                    type="submit"
                    value="Submit"
                    className="mt-6 px-4 py-2 bg-secondary-text-color text-secondary-color rounded-md cursor-pointer focus:bg-blue-700 focus:outline-none"
                />
            </form>
        </div>
    );
}

export default RegenerateEmailVer;
