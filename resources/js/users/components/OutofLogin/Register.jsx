import React, { useState } from 'react'
import axios from 'axios'
import { useAlert } from 'react-alert'
import { Link } from 'react-router-dom'
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { Tooltip } from '@mui/material';

function Register() {
    const alerts = useAlert()
    const register = (e) => {
        e.preventDefault();
        alerts.info("Registration started, please wait...")
        if ((phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && acceptedTerms) {//TODO: email, birthdate,passwd registration
            axios.post('/api/auth/user/register', {
                email: email,
                phone: phone,
                firstName: firsName,
                middleName: (middleName != "") ? middleName : null,
                lastName: lastName,
                password: Buffer.from(password).toString('base64'),
                birthDate: birthDate,
                gender: gender,
                pronouns: pronoun,
                tag: tag,
                acceptedTerms: acceptedTerms
            }).then(response => {
                if (response.status == 200) {
                    alerts.info("Register successful, Verificate your email!")
                }
            }).catch(error => {
                alerts.error("Something went wrong!")
            })
        } else {
            if (acceptedTerms == false) {
                alerts.error("You need to accept the terms!");
            } else {
                alerts.error("Not valid datas!");
            }
        }
    }
    var curr = new Date();
    curr.setDate(curr.getDate() - (16 * 365 + 3))
    var maxDate = curr.toISOString().substring(0, 10);
    curr.setDate(curr.getDate() - (116 * 365))
    var minDate = curr.toISOString().substring(0, 10);
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [firsName, setFirsName] = useState("")
    const [middleName, setMiddleName] = useState("")
    const [lastName, setLastName] = useState("")
    const [tag, setTag] = useState("")
    const [password, setPassword] = useState("")
    const [birthDate, setBirthDate] = useState(maxDate)
    const [gender, setGender] = useState("")
    const [isNoneGender, setIsNoneGender] = useState(false)
    const [pronoun, setPronoun] = useState("")
    const [acceptedTerms, setAcceptedTerms] = useState(false)

    return (
        <div className='flex flex-row h-full'>
            <div className="w-1/2 flex flex-col justify-center items-center h-full">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    Welcome to Bubuus!
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl mb-8">
                    Connect with friends and share your stories with the world!
                </p>
                <p className="text-lg md:text-xl lg:text-2xl">
                    Register now and join the fun!
                </p>
            </div>
            <div className="w-1/2 mx-auto h-full">
                <form onSubmit={register} className="shadow-md w-full h-full rounded px-8 py-8 mb-4  flex flex-col justify-center items-center">
                    <h1 className="text-lg md:text-xl lg:text-2xl mb-8 font-bold">
                        Register here
                    </h1>
                    <p>
                        You need to fill the inputs marked with *
                    </p>
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full md:w-1/3 px-2 mb-4">
                            <label htmlFor="firstName" className="block text-gray-700 font-bold mb-2">Firstname *</label>
                            <input
                                className='input-style text-gray-900'
                                type="text"
                                placeholder="Firstname"
                                autoComplete="off"
                                value={firsName}
                                onChange={(e) => setFirsName(e.target.value.trim())}
                                required
                                id="firstName"
                                name="firstName"
                            />
                        </div>
                        <div className="w-full md:w-1/3 px-2 mb-4">
                            <label htmlFor="middleName" className="block text-gray-700 font-bold mb-2">Middlename</label>
                            <input
                                className='input-style text-gray-900'
                                type="text"
                                placeholder="Middlename"
                                autoComplete="off"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value.trim())}
                                id="middleName"
                                name="middleName"
                            />
                        </div>
                        <div className="w-full md:w-1/3 px-2 mb-4">
                            <label htmlFor="lastName" className="block text-gray-700 font-bold mb-2">Lastname *</label>
                            <input
                                className='input-style text-gray-900'
                                type="text"
                                placeholder="Lastname"
                                autoComplete="off"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value.trim())}
                                required
                                id="lastName"
                                name="lastName"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full md:w-1/3 px-2 mb-4">
                            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email *</label>
                            <input
                                className={(email.match(/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/)) ? 'input-style text-gray-900' : 'error-input-style text-gray-900'}
                                type="text"
                                placeholder="Email"
                                autoComplete="off"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.trim())}
                                required
                                id="email"
                                name="email"
                            />
                        </div>
                        <div className="w-full md:w-1/3 px-2 mb-4">
                            <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">Phone *</label>
                            <input
                                className={(phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)) ? 'input-style text-gray-900' : 'error-input-style text-gray-900'}
                                type="text"
                                placeholder="+36121234567"
                                autoComplete="off"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.trim())}
                                required
                                id="phone"
                                name="phone"
                            />
                        </div>
                        <div className="w-full md:w-1/3 px-2 mb-4">
                            <label htmlFor="tag" className="block text-gray-700 font-bold mb-2">Tag</label>
                            <input
                                className='input-style text-gray-900'
                                type="text"
                                placeholder="Tag"
                                autoComplete="off"
                                value={tag}
                                onChange={(e) => setTag(e.target.value.trim())}
                                id="tag"
                                name="tag"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full md:w-1/3 px-2 mb-4">
                            <label htmlFor="birthDate" className="block text-gray-700 font-bold mb-2">Birthdate *</label>
                            <input
                                type="date"
                                className={(minDate <= birthDate || maxDate >= birthDate) ? 'input-style text-gray-900' : 'error-input-style text-gray-900'}
                                autoComplete="off"
                                max={maxDate}
                                min={minDate}
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                required
                                id="birthDate"
                                pattern="\d{4}-\d{2}-\d{2}"
                                name="birthDate"
                            />
                        </div>
                        <div className="w-full md:w-1/3 px-2 mb-4">
                            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password *</label>
                            <div className='w-full flex'>
                                <input
                                    className='input-style text-gray-900 w-11/12'
                                    type="password"
                                    placeholder="Password"
                                    autoComplete="off"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value.trim())}
                                    required
                                    id="password"
                                    name="password"
                                />
                                <Tooltip title="Needed: Capital letter, small letter, number and special character and need to be 8 characters atleast.">
                                    <InfoTwoToneIcon />
                                </Tooltip>
                            </div>
                        </div>
                        <div className="w-full md:w-1/3 px-2 mb-4">
                            <label htmlFor="gender" className="block text-gray-700 font-bold mb-2">Gender *</label>
                            <select className=' text-gray-900' onChange={(e) => { setGender(e.target.value); (e.target.value == 'Other') ? setIsNoneGender(true) : setIsNoneGender(false); }} id="gender" name="gender">
                                <option value="None">None</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary (Canada only)</option>
                                <option value="Wallmart Bag">Wallmart Bag</option>
                                <option value="Other">Other</option>
                            </select>
                            {(isNoneGender) ? <input
                                className={(gender != "") ? 'input-style text-gray-900' : 'error-input-style text-gray-900'}
                                type="text"
                                placeholder="Gender"
                                autoComplete="off"
                                value={gender}
                                onChange={(e) => setGender(e.target.value.trim())}
                                required
                                id="gender-other"
                                name="gender-other"
                            /> : null}
                        </div>
                    </div>
                    <div className="flex flex-wrap -mx-2">
                        <div className="w-full md:w-1/2 px-2 mb-4">
                            <label htmlFor="pronoun" className="block text-gray-700 font-bold mb-2">Pronoun *</label>
                            <input
                                className='input-style text-gray-900'
                                type="text"
                                placeholder="Pronoun"
                                autoComplete="off"
                                value={pronoun}
                                onChange={(e) => setPronoun(e.target.value)}
                                required
                                id="pronoun"
                                name="pronoun"
                            />
                        </div>
                        <div className="w-full md:w-1/2 px-2 mb-4">
                            <label htmlFor="terms" className="block text-gray-700 font-bold mb-2">
                                <Link to={"/terms"} target="_blank">Terms</Link> and conditions: *
                            </label>
                            Accept:
                            <input
                                className='input-style text-gray-900'
                                type="checkbox"
                                value={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                required
                                id="terms"
                                name="terms"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Register
