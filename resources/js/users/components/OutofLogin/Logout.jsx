import React from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/userSlice";
import Cookies from 'universal-cookie';

function Logout({ setIsOpenFalse }) {
    const id = useSelector((state) => state.user.id);
    const dispatch = useDispatch();
    function loggingout() {
        var cookies = new Cookies();
        axios.get("/api/users/" + id)
            .then((response) => {
                axios.post("/api/users/logout", {
                    id: id,
                    email: response.data["email"],
                })
                    .then((res) => {
                        if (res.status == 200) {
                            dispatch(logout());
                            cookies.remove('user', { path: '/' });
                            console.log("User logged out Successfully");
                            setIsOpenFalse()
                        }
                    })
                    .catch((err) => {
                        console.log(err.message);
                    });
            })
            .catch((error) => {
                console.log(error.message);
            });
    }
    return (
        <div className='item block px-4 py-2 text-sm '>
            <button type="button" onClick={() => loggingout()}>
                Logout
            </button>
        </div>
    );
}

export default Logout;
