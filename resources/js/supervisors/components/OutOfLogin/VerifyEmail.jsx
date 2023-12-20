import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { useAlert } from "react-alert";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function EmailVerification() {
    let { hash } = useParams();
    const alerts = useAlert();
    const loggedInID = useSelector((state) => state.supervisor.id);
    const navigate = useNavigate();
    const [verified, setVerified] = useState(false);

   /* `useEffect` is a hook in React that allows you to perform side effects in function components. In
   this case, the `useEffect` hook is used to redirect the user to the home page if they are already
   logged in. */
    useEffect(() => {
        if (loggedInID > 0) navigate("/");
    }, [loggedInID]);

   /**
    * This function sends a PUT request to verify an email using a hash and displays a success message
    * if successful, or an error message if unsuccessful.
    */
    const emailVerificate = () => {
        console.log(hash);
        axios
            .put("/api/auth/supervisor/verify", {
                hash: hash,
            })
            .then((res) => {
                alerts.success(res.data);
                setVerified(true);
            })
            .catch((err) => {
                alerts.error("Verification link is used or does not exist");
                console.log(err);
            });
    };

    return (
        <div className="w-full h-full bg-secondary-color text-secondary-text-color flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold">Email Verification</h1>
            <section className="mt-5">
                <button
                    disabled={verified}
                    onClick={() => {
                        emailVerificate();
                    }}
                    className="px-4 py-2 rounded-md bg-white text-secondary-color font-medium disabled:opacity-50"
                >
                    {verified ? "Profile Verified" : "Verify My Profile"}
                </button>
            </section>
        </div>
    );
}

export default EmailVerification;
