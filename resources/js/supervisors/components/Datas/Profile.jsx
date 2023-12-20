import { Tooltip } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { useSelector } from "react-redux";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';

function Profile() {
    const loggedInID = useSelector((state) => state.supervisor.id);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [tag, setTag] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [isDark, setIsDark] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordCheck, setNewPasswordCheck] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const alerts = useAlert();

    /* The above code is using the `useEffect` hook to fetch data from an API endpoint using Axios. It
    is fetching data for a supervisor with a specific ID (`loggedInID`) and setting the fetched data
    to state variables using `setEmail`, `setPhone`, `setTag`, `setFirstName`, `setMiddleName`,
    `setLastName`, `setBirthDate`, `isDark`. The `isLoading` state variable is also being set to
    `false` after the data has been fetched. The `useEffect` hook is triggered whenever the
    `loggedInID` state variable changes. */
    useEffect(() => {
        if (loggedInID > 0) {
            axios
                .get("/api/supervisors/datas")
                .then((res) => {
                    setEmail(res.data.email);
                    setPhone(res.data.phone);
                    setTag(res.data.tag);
                    setFirstName(res.data.firstName);
                    setMiddleName(res.data.middleName==null?"":res.data.middleName);
                    setLastName(res.data.lastName);
                    setBirthDate(res.data.birthDate);
                    setIsDark(res.data.isDark);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [loggedInID]);
    /**
     * The function updates a user's profile information if the phone number and email are valid.
     */
    const updateProfile = (e) => {
        e.preventDefault();
        if (
            phone.match(
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
            ) &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            axios
                .post("/api/supervisors/editSettings/" + loggedInID, {
                    email: email,
                    phone: phone,
                    firstName: firstName,
                    middleName: middleName != "" ? middleName : null,
                    lastName: lastName,
                    birthDate: birthDate,
                    Password: Buffer.from(password).toString("base64"),
                    isDark: isDark,
                    tag: tag,
                })
                .then((res) => {
                    alerts.success(res.data.message);
                })
                .catch((err) => {
                    alerts.error("Somthing went wrong!");
                    console.log(err);
                });
        }
    };
    /**
     * The function updates a user's password if it meets certain criteria and displays an error
     * message if it does not.
     */
    const updatePassword = (e) => {
        e.preventDefault();
        if (
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(
                newPassword
            ) &&
            newPassword == newPasswordCheck
        ) {
            axios
                .post("/api/supervisors/editPasswd/" + loggedInID, {
                    password: Buffer.from(oldPassword).toString("base64"),
                    newPassword: Buffer.from(newPassword).toString("base64"),
                })
                .then((res) => {
                    alerts.success(res.data.message);
                })
                .catch((err) => {
                    alerts.error("Somthing went wrong!");
                    console.log(err);
                });
        } else {
            alerts.error(
                "The new password does not match with the validator field!"
            );
        }
    };
    return isLoading == false ? (
        <div className="w-full">
            <form
                onSubmit={updateProfile}
                className="w-full max-w-md mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg text-gray-700"
            >
                <div className="mb-6">
                    <label
                        htmlFor="email"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="text"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="phone"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Phone Number
                    </label>
                    <input
                        id="phone"
                        type="text"
                        required
                        onChange={(e) => setPhone(e.target.value)}
                        value={phone}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="tag"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Tag
                    </label>
                    <input
                        id="tag"
                        type="text"
                        required
                        onChange={(e) => setTag(e.target.value)}
                        value={tag}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="firstName"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Firstname
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        required
                        onChange={(e) => setFirstName(e.target.value)}
                        value={firstName}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="middleName"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Middlename
                    </label>
                    <input
                        id="middleName"
                        type="text"
                        onChange={(e) => setMiddleName(e.target.value)}
                        value={middleName}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="lastName"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Lastname
                    </label>
                    <input
                        id="lastName"
                        type="text"
                        required
                        onChange={(e) => setLastName(e.target.value)}
                        value={lastName}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="birthdate"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Birthdate
                    </label>
                    <input
                        id="birthdate"
                        type="date"
                        required
                        onChange={(e) => setBirthDate(e.target.value)}
                        value={birthDate}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="websiteTheme"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Website Theme
                    </label>
                    <select
                        id="websiteTheme"
                        onChange={(e) => {
                            e.target.value === "Dark"
                                ? setIsDark(true)
                                : setIsDark(false);
                        }}
                        value={isDark ? "Dark" : "Light"}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    >
                        <option value="Dark">Dark</option>
                        <option value="Light">Light</option>
                    </select>
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Password
                    </label>
                    <div className="w-full flex">
                        <div className="w-11/12">
                            <input
                                id="password"
                                type="password"
                                required
                                onChange={(e) => {
                                    setOldPassword(e.target.value);
                                }}
                                value={oldPassword}
                                className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                            />
                        </div>
                        <div className="w-1/12">
                            <Tooltip title="Needed: Capital letter, small letter, number and special character and need to be 8 characters atleast.">
                                <InfoTwoToneIcon />
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full px-4 py-2 text-lg font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
                >
                    Submit
                </button>
            </form>
            <form
                onSubmit={updatePassword}
                className="w-full max-w-md mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg"
            >
                <h1
                    className=" text-gray-700">
                    You can update your password here
                </h1>
                <div className="mb-6">
                    <label
                        htmlFor="old-password"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Old Password
                    </label>
                    <input
                        required
                        id="old-password"
                        type="password"
                        onChange={(e) => {
                            setOldPassword(e.target.value);
                        }}
                        value={oldPassword}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="new-password"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        New Password
                    </label>
                    <input
                        required
                        id="new-password"
                        type="password"
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                        }}
                        value={newPassword}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="new-password-check"
                        className="block mb-2 font-bold text-gray-700"
                    >
                        Confirm New Password
                    </label>
                    <input
                        required
                        id="new-password-check"
                        type="password"
                        value={newPasswordCheck}
                        onChange={(e) => {
                            setNewPasswordCheck(e.target.value);
                        }}
                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full px-4 py-2 text-lg font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
                >
                    Submit
                </button>
            </form>
        </div>
    ) : null;
}

export default Profile;
