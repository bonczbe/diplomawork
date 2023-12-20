import axios from "axios";
import React, { useState, useEffect } from "react";
import { useAlert } from "react-alert";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../sass/popup.css'
import AdminElement from "./Admin";


function Admins() {
    const role = useSelector((state) => state.supervisor.role);
    const loggedInID = useSelector((state) => state.supervisor.id)
    const navigate = useNavigate();
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [firstName, setFirstName] = useState("")
    const [middleName, setMiddleName] = useState("")
    const [lastName, setLastName] = useState("")
    const [birthDate, setBirthDate] = useState("")
    const [tag, setTag] = useState("")
    const [roleOfMember, setRole] = useState(1)
    const [isDark, setIsDark] = useState(false)
    const [admins, setAdmins] = useState([])
    const alerts = useAlert()

    /* The above code is using the useEffect hook in a React component to perform some actions when the
    component mounts or when certain dependencies change. */
    useEffect(() => {
        if (role != 2 || loggedInID < 1) {
            navigate("/supervisors/panel/permission");
        }
        axios.get('/api/supervisors/admins').then((res) => {
            setAdmins(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }, [role, loggedInID]);

    /**
     * The function generates a random password of length 10 with a mix of uppercase and lowercase
     * letters, numbers, and special characters, and ensures that it meets certain complexity
     * requirements.
     * @returns The function `passwdGenerator` returns a randomly generated password that meets certain
     * criteria. If the generated password does not meet the criteria, the function recursively calls
     * itself until a valid password is generated.
     */
    const passwdGenerator = () => {
        const length = 10;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&.';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%?&.,-])(?=.*[a-zA-Z]).{8,}$/
        if (regex.test(result)) {
            return result;
        } else {
            return passwdGenerator();
        }
    }
    /**
     * The above code defines two functions, one for adding a new admin and another for removing an
     * admin, both of which use axios to make API calls.
     */
    const newAdmin = async (e) => {
        e.preventDefault()
        const passwd = await Buffer.from(passwdGenerator()).toString('base64')
        axios.post('/api/supervisors/register', {
            userID: loggedInID,
            role: roleOfMember,
            email: email,
            phone: phone,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            password: passwd,
            birthDate: birthDate,
            isDark: isDark,
            tag: tag

        }).then((res) => {
            alerts.success("Admin successfully added")
            setEmail("")
            setPhone("")
            setFirstName("")
            setMiddleName("")
            setLastName("")
            setBirthDate("")
            useState("")
            setRole(1)
            setIsDark(false)
            setAdmins([
                ...admins,
                res.data
            ])
        }).catch((err) => {
            alerts.error("Something went wrong!")
            console.log(err)
        })
    }
    const removingAdmin = async (id) => {
        let helper = await admins.filter((admin) => {
            return admin.id != id
        })
        setAdmins(helper)
    }

    return (
        <div className="w-full h-full">
            <h1 className="w-full text-center text-3xl font-bold">List Of Admins</h1>
            <Popup
                trigger={<div className='w-full text-center'><button className="button px-2 py-1 rounded-md bg-blue-500 text-white font-medium disabled:opacity-50"> Add new Admin </button></div>}
                modal
            >
                {close => (
                    <div className="modal bg-secondary-color" >
                        <button className="close" onClick={close}>
                            &times;
                        </button>
                        <div className="header bg-secondary-color text-white">
                            Add new Admin
                        </div>
                        <div className="content text-center bg-secondary-color text-white">
                            <form onSubmit={newAdmin} className="w-full text-gray-700">
                                <p className="text-white">
                                    You need to fill the inputs marked with *
                                </p>
                                <div className="mb-4">
                                    <label className="block font-bold text-gray-700" htmlFor="email">
                                        Email Address *
                                    </label>
                                    <input
                                        id="email"
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 leading-tight border rounded-lg shadow-sm appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-bold text-gray-700" htmlFor="phone">
                                        Phone number *
                                    </label>
                                    <input
                                        id="phone"
                                        type="text"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-3 py-2 leading-tight border rounded-lg shadow-sm appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-bold text-gray-700" htmlFor="phone">
                                        Tag
                                    </label>
                                    <input
                                        id="tag"
                                        type="text"
                                        required
                                        value={tag}
                                        onChange={(e) => setTag(e.target.value)}
                                        className="w-full px-3 py-2 leading-tight border rounded-lg shadow-sm appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-bold text-gray-700" htmlFor="firstName">
                                        Firstname *
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-3 py-2 leading-tight border rounded-lg shadow-sm appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-bold text-gray-700" htmlFor="middleName">
                                        Middlename
                                    </label>
                                    <input
                                        id="middleName"
                                        type="text"
                                        value={middleName}
                                        onChange={(e) => setMiddleName(e.target.value)}
                                        className="w-full px-3 py-2 leading-tight border rounded-lg shadow-sm appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-bold text-gray-700" htmlFor="lastName">
                                        Lastname *
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-3 py-2 leading-tight border rounded-lg shadow-sm appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="birthdate" className="block font-bold text-gray-700 mb-2">
                                        Birthdate *
                                    </label>
                                    <input
                                        id="birthdate"
                                        type="date"
                                        required
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        className="w-full px-3 py-2 leading-tight border rounded-lg shadow-sm appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="Admin" className="block font-bold text-gray-700 mb-2">
                                        Will be admin or owner? *
                                    </label>
                                    <select
                                        id="Admin"
                                        onChange={(e) => {
                                            (e.target.value === "Admin") ? setRole(1) : setIsDark(2);
                                        }}
                                        value={(roleOfMember == 1) ? "Admin" : "Owner"}
                                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Owner">Owner</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="websiteTheme" className="block mb-2 font-bold text-gray-700">
                                        Website Theme *
                                    </label>
                                    <select
                                        id="websiteTheme"
                                        onChange={(e) => {
                                            (e.target.value === "Dark") ? setIsDark(true) : setIsDark(false);
                                        }}
                                        value={(isDark) ? "Dark" : "Light"}
                                        className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 text-gray-900"
                                    >
                                        <option value="Dark">Dark</option>
                                        <option value="Light">Light</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded py-1 px-3"
                                >
                                    Create
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </Popup>
            <div className="w-full">
                <div className="w-full" key={admins.length}>
                    {
                        (admins.length == 0) ? (
                            <span>There is no admin</span>
                        ) : (
                            admins.map((admin) => {
                                return <AdminElement key={admin.id} data={admin} removingAdmin={removingAdmin} />
                            })
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default Admins;
