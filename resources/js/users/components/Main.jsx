import React from "react";
import ReactDOM from "react-dom";
import Routing from "./Routing";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "../Redux/store";
import { positions, Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import NavBar from "./Datas/NavBar";
import Footer from "./Datas/Footer";

function Main() {
    const options = {
        timeout: 4500,
        position: positions.TOP_CENTER,
        offset: "90px"
    };

    return (
        <div className="h-screen max-h-screen" style={{ minWidth: 1280 }}>
            <Provider store={store}>
                <AlertProvider template={AlertTemplate} {...options}>
                    <BrowserRouter>
                        <div className="h-full w-full flex flex-col">
                            <NavBar />
                            <Routing />
                            <Footer />
                        </div>
                    </BrowserRouter>
                </AlertProvider>
            </Provider>
        </div>
    );
}

export default Main;

if (document.getElementById("main")) {
    ReactDOM.render(<Main />, document.getElementById("main"));
}