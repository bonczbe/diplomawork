import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { useAlert } from "react-alert";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function EmailVerification() {
    let { hash } = useParams();
    const alerts = useAlert();
    const loggedInID = useSelector((state) => state.user.id);
    const navigate = useNavigate();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        if (loggedInID > 0) navigate("/home");
    }, [loggedInID]);

    const emailVerificate = () => {
        axios
            .put("/api/auth/user/verify", {
                hash: hash,
            })
            .then((res) => {
                alerts.success("Email verified");
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
