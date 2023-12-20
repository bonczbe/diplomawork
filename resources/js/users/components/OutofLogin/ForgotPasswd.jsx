import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { useAlert } from "react-alert";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function ForgotPasswd() {
    const loggedInID = useSelector((state) => state.user.id);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const alerts = useAlert();
    useEffect(() => {
        if (loggedInID > 0) {
            navigate("/home");
        }
    }, [loggedInID]);
    const resettingPassws = (e) => {
        e.preventDefault();
        if (loggedInID < 1) {
            axios
                .post("/api/auth/user/newPasswordHash", {
                    email: userEmail,
                })
                .then(() => {
                    alerts.success("Email sent!");
                    setUserEmail("")
                })
                .catch(() => {
                    alerts.error("Something went wrong!");
                });
        } else {
            alerts.info("You are logged in, how dare you!");
        }
    };
    return (
        <div className="w-full h-full flex justify-center items-center">
            <form
                onSubmit={resettingPassws}
                className=" p-6 rounded-lg shadow-md"
            >
                <h1 className="text-center mb-4 text-2xl font-bold">
                    New Password Request
                </h1>
                <label htmlFor="email" className="block mb-2  font-medium">
                    Email:
                </label>
                <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value.trim())}
                    required
                    id="email"
                    name="email"
                    className={ `block w-full py-2 px-3 border text-gray-900 rounded-lg shadow-sm  focus:outline-none focus:ring-2 focus:ring-secondary-color focus:border-transparent ${userEmail.match(
                        /^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/
                    )
                            ? "border-gray-400 focus:border-secondary-color"
                            : "border-red-500 focus:border-red-700"
                        }`}
                />
                <button
                    type="submit"
                    className="bg-secondary-text-color text-secondary-color py-2 px-4 mt-4 rounded-md font-medium hover:bg-opacity-80 transition-all duration-200"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}

export default ForgotPasswd;
