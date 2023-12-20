import axios from 'axios'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { useNavigate } from 'react-router-dom';

function ThingProfName({ member, setterActual, fromMessages, isOnline }) {
    const navigat = useNavigate()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState()
    const [times, setTimes] = useState(0)
    const loggedInID = useSelector((state) => state.user.id)
    useEffect(() => {
        let isMounted = true;
        const unmountedChecker = () => {
            let thingID = (typeof member.user1ID != "undefined" && typeof member.user2ID != "undefined") ? ((loggedInID == member.user1ID) ? member.user2ID : member.user1ID) : ((typeof member.groupChatID != "undefined") ? member.groupChatID : member.id);
            try {
                axios.get('/api/profilepics/showActual/' + ((typeof member.user1ID != "undefined" || member.type == "user") ? "user" : "groupChat") + '/' + thingID).then((res) => {
                    if (typeof member.user2ID != "undefined" || member.type == "user") {
                        axios.get('/api/users/ById/' + thingID).then((response) => {
                            if (isMounted) {
                                setData({
                                    name: response.data,
                                    profimage: res.data.profilePicURI
                                });
                                setLoading(false);
                            }
                        })
                    } else if (member.type == "groupChat") {
                        axios.get('/api/groupchat/ById/' + thingID).then((response) => {
                            if (isMounted) {
                                setData({
                                    name: response.data,
                                    profimage: res.data.profilePicURI
                                });
                                setLoading(false);
                            }
                        })
                    } else {
                        if (isMounted) {
                            setData({});
                            setLoading(false);
                        }
                    }
                })
            } catch (err) {
                console.log(err);
            }
        };
        unmountedChecker();
        return () => {
            isMounted = false;
        };
    }, [loggedInID]);
    useEffect(() => {
        let isMounted = true;
        const unmountedChecker=() => {
            try {
                    if (member.type == "user"&&isMounted) {
                        member.channel.here(async (users) => {
                            if(isMounted){
                                let helper = await users.filter((user) => {
                                    return (user.id != loggedInID)
                                })
                                setTimes(helper.length)
                            }
                        }).joining((user) => {
                            if(isMounted){
                                if(user.id!=loggedInID){
                                    setTimes(times+1)
                                }
                            }
                        }).leaving((user) => {
                            if(isMounted){
                                if(user.id!=loggedInID){
                                    setTimes(times-1)
                                }
                            }
                        })
                    } else if(isMounted){
                        member.channel.here(async (groups) => {
                            if(isMounted){
                                let helper = await groups.filter((user) => {
                                    return (user.id != loggedInID)
                                })
                                setTimes(helper.length)
                            }
                        }).joining((user) => {
                            if(isMounted){
                                if(user.id!=loggedInID){
                                    setTimes(times+1)
                                }
                            }
                        }).leaving((user) => {
                            if(isMounted){
                                if(user.id!=loggedInID){
                                    setTimes(times-1)
                                }
                            }
                        })
                    }
            } catch (err) {
                console.log(err);
            }
        }
        unmountedChecker();
        return () => {
            isMounted = false;
        };
    }, [loggedInID, member])


    return (!loading && data != {}) ? (
        <div className='w-full leading-8 cursor-pointer my-3' role='button' onClick={() => {
            if (fromMessages == undefined) {
                setterActual(member, ((fromMessages == undefined) ? true : undefined))
                navigat("/messages")
            }
        }}>
            <div className="float-left h-4">
                {(isOnline==undefined)?null:((isOnline) ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />)}
            </div>
            <div className="float-left mx-2 w-fit shadow-smaller rounded-full bg-profImage-bg-color">
                <img src={data.profimage} className="float-left w-auto h-8 rounded-full" />
            </div>
            <span className='truncate block'>{data.name}</span>
        </div>
    ) : null;
}

export default ThingProfName
