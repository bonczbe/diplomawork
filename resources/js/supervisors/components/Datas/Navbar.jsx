import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { login, loading, logout } from "../../Redux/userSlice";
import { setMode } from "../../Redux/settingsSlice";

function Navbar() {
    const dispatch = useDispatch();
    const loggedInID = useSelector((state) => state.supervisor.id);
    const role = useSelector((state) => state.supervisor.role);
    const firstName = useSelector((state) => state.supervisor.firstName);
    var cookies = new Cookies();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    /* The `useEffect` hook is used to perform side effects in a functional component. In this case, it
    is being used to perform two asynchronous operations when the component mounts: */
    useEffect(async () => {
        await axios
            .get("/sanctum/csrf-cookie")
            .then(() => {
                console.log("Authentication could be successful");
            })
            .catch((error) => {
                console.log(error);
            });

        if (
            cookies.get("supervisor") &&
            cookies.get("supervisor").email != ""
        ) {
            await axios
                .post("/api/auth/supervisor/login", {
                    email: Buffer.from(
                        cookies.get("supervisor").email,
                        "base64"
                    ).toString("utf8"),
                    password: cookies.get("supervisor").password,
                })
                .then((res) => {
                    if (res.status == 200) {
                        dispatch(
                            login({
                                id: res.data["id"],
                                tag: res.data["tag"],
                                email: res.data["email"],
                                role: res.data["role"],
                                firstName: res.data["firstName"],
                            })
                        );
                        dispatch(setMode({ isDark: res.data["isDark"] }));
                        console.log("Admin logged in successfully");
                        setIsLoading(false)
                    }
                })
                .catch((err) => {
                    console.log(err.message);
                });
        }else{
            setIsLoading(false)
        }
        dispatch(loading({ isLoading: false }));
    }, []);

    /**
     * This function logs in a supervisor by sending a POST request to an API endpoint with the
     * supervisor's email and password, and then sets a cookie with the login information.
     */
    const loggigIN = (e) => {
        e.preventDefault();
        axios
            .post("/api/auth/supervisor/login", {
                email: email,
                password: Buffer.from(password).toString("base64"),
            })
            .then((response) => {
                if (response.status == 200) {
                    dispatch(
                        login({
                            id: response.data["id"],
                            tag: response.data["tag"],
                            email: response.data["email"],
                            role: response.data["role"],
                            firstName: response.data["firstName"],
                        })
                    );
                    dispatch(setMode({ isDark: response.data["isDark"] }));
                    console.log("Admin logged in successfully");
                    const current = new Date();
                    const exprireDate = new Date(
                        current.getTime() + 12 * 60 * 60 * 1000
                    );
                    cookies.set(
                        "supervisor",
                        {
                            email: Buffer.from(email).toString("base64"),
                            password: Buffer.from(password).toString("base64"),
                        },
                        { path: "/", expires: exprireDate }
                    );
                }
            })
            .catch((error) => {
                console.log(error.message);
            });
    };
    /**
     * This function logs out a supervisor by sending a POST request to the server with their email and
     * ID, then removes their cookie and dispatches a logout action.
     */
    const loggingout = () => {
        axios
            .post("/api/supervisors/logout", {
                email: Buffer.from(
                    cookies.get("supervisor").email,
                    "base64"
                ).toString("utf8"),
                id: loggedInID,
            })
            .then(() => {
                dispatch(logout());
                cookies.remove("supervisor", { path: "/" });
            })
            .catch((err) => {
                console.log(err);
            });
    };
    return (
        <nav className="flex items-center justify-between bg-main-color py-2 px-6 text-main-text-color shadow-lg shadow-cyan-500/50 border-b border-left-rigth-text-color">
            <Link to="/supervisors/panel/" className="flex-shrink-0 w-32">
                <img
                    src="/images/logo.png"
                    alt="Logo"
                    className="h-10 w-10 rounded-full block"
                />
            </Link>
            {(isLoading)?(null):loggedInID > 0 ? (
                <div className="flex space-x-4">
                    <Link
                        to={"/supervisors/panel/"}
                        className="font-medium text-gray-200 hover:text-gray-400"
                    >
                        {firstName}
                    </Link>
                    <Link
                        to={"/supervisors/panel/profile"}
                        className="font-medium text-gray-200 hover:text-gray-400"
                    >
                        Profile
                    </Link>
                    <Link
                        to={"/supervisors/panel/"}
                        className="font-medium text-gray-200 hover:text-gray-400"
                    >
                        Reports
                    </Link>
                    {role === 2 && (
                        <>
                            <Link
                                to={"/supervisors/panel/owner"}
                                className="font-medium text-gray-200 hover:text-gray-400"
                            >
                                Owner Panel
                            </Link>
                            <Link
                                to={"/supervisors/panel/admins"}
                                className="font-medium text-gray-200 hover:text-gray-400"
                            >
                                Admins
                            </Link>
                        </>
                    )}
                    <button
                            type="button"
                            onClick={()=>{loggingout()}}
                            className="px-3"
                        >
                            Logout
                    </button>
                </div>
            ) : (
                <div className="flex">

                    <Link
                        to={"/supervisors/panel/newPasswd"}
                        className="font-medium text-gray-200 hover:text-gray-400 mx-3"
                    >
                        Forgotten password
                    </Link>
                    <form onSubmit={loggigIN} className="flex space-x-4">
                        <label className="font-medium text-gray-600">Email:</label>
                        <input
                            type="text"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-gray-400 rounded py-1 px-3 text-gray-900"
                        />
                        <label className="font-medium text-gray-600">
                            Password:
                        </label>
                        <input
                            type="password"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-gray-400 rounded py-1 px-3 text-gray-900"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded py-1 px-3"
                        >
                            Login
                        </button>
                    </form>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
