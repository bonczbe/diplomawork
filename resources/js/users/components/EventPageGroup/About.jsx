import React from 'react'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import '../../../../sass/popup.css'

function About({ type, data }) {
    /* This is a React functional component that takes in two props, `type` and `data`. The `switch`
    statement checks the value of `type` and returns different JSX elements based on the value. */
    switch (type) {
        case "page":
            return (
                <div className='w-full'>
                    <div className="item w-11/12 float-left h-fit flex">
                        <section className='float-left mr-3 item h-full w-3/12 flex flex-col break-words'>
                            <span>Description:</span> {(data.description) ? data.description : "-"}
                        </section>
                        <section className='float-left mr-3 item w-3/12 text-center flex flex-col'>
                            <span>Web Page:</span> {(data.webURI) ? data.webURI : "unknown"}
                        </section>
                        <section className='float-left mr-3 item w-3/12 text-center flex flex-col'>
                            <span>Place:</span> {(data.place) ? data.place : "unknown"}
                        </section>
                        <section className='float-left mr-3 item w-3/12 text-center flex flex-col'>
                            <span>Type of Business:</span> {(data.businessType) ? data.businessType : "unknown"}
                        </section>
                    </div>
                    <div className="w-full h-fit flex">
                        <section className='w-1/3 float-left mr-3 item text-center flex flex-col'>
                            <span>Email:</span> {(data.email) ? data.email : "unknown"}
                        </section>
                        <section className='w-1/3 float-left mr-3 item text-center flex flex-col'>
                            <span>Phone:</span> {(data.phone) ? data.phone : "unknown"}
                        </section>
                        <section className='w-1/3 text-center flex flex-col item'>
                            <span>
                                Open hours
                            </span>
                            {(data.businessHours) ? <Popup
                                trigger={<div className='w-full text-center'><button className="button"> Check out </button></div>}
                                modal
                            >
                                {close => (
                                    <div className="modal">
                                        <button className="close" onClick={close}>
                                            &times;
                                        </button>
                                        <div className="header"> Open Hours </div>
                                        <div className="content text-center">
                                            {(data.businessHours) ? (
                                                <div>
                                                    {JSON.parse(data.businessHours).map((item) => {
                                                        const key = Object.keys(item)[0]
                                                        return <section className='item' key={key}> {key}: {item[key]["Open"]} - {item[key]["Close"]} </section>
                                                    })}
                                                </div>) : "unknown"
                                            }
                                        </div>
                                    </div>
                                )}
                            </Popup> : "unknown"}

                        </section>
                    </div>
                </div>
            )
        case "group":
            return (
                <div className='w-full'>
                    <div className="item w-11/12 float-left h-fit flex">
                        <section className='float-left mr-3 item h-full w-8/12 flex flex-col break-words' style={{ whiteSpace: "pre-wrap" }}>
                            <span>Description:</span> {(data.description) ? data.description : "-"}
                        </section>
                        <section className='float-left mr-3 item w-4/12 text-center flex flex-col'>
                            <span>Type:</span> {(typeof data.status !== "undefined") ? ((data.status === true) ? "Public" : "Private") : "unknown"}
                        </section>
                    </div>
                </div>
            )
        case "event":
            return (
                <div className='w-full'>
                    <div className="item w-11/12 float-left h-fit flex">
                        <section className='float-left mr-3 item h-full w-8/12 flex flex-col break-words'>
                            <span>Description:</span> {(data.description) ? data.description : "-"}
                        </section>
                        <section className='float-left mr-3 item w-4/12 text-center flex flex-col'>
                            <span>Start:</span> {(typeof data.startDate !== "undefined") ? data.startDate : "unknown"}
                        </section>
                        <section className='float-left mr-3 item w-4/12 text-center flex flex-col'>
                            <span>End:</span> {(typeof data.endDate !== "undefined") ? data.endDate : "unknown"}
                        </section>
                        <section className='float-left mr-3 item w-4/12 text-center flex flex-col'>
                            <span>Website:</span> {(typeof data.pageURL != "undefined"&&data.pageURL!=null) ? data.pageURL : "unknown"}
                        </section>
                        <section className='float-left mr-3 item w-4/12 text-center flex flex-col'>
                            <span>Place:</span> {(typeof data.place != "undefined"&&data.place!=null) ? data.place : "unknown"}
                        </section>
                    </div>
                </div>
            )
        default:
            return (
                <div className="item w-11/12 float-left h-full flex">
                    &nbsp;
                </div>
            )
    }

}

export default About
