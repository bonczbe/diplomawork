import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "../Redux/store";
import { positions, Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import Routing from "./Routing";
import Navbar from "./Datas/Navbar";
import Footer from "../../users/components/Datas/Footer";

/**
 * The Main function returns a JSX element that renders a React application with a provider, alert
 * provider, browser router, navbar, routing, and footer components.
 * @returns A JSX element containing a div with class "h-screen max-h-screen" and a style attribute
 * with a minWidth of 1280. Inside the div, there is a Provider component with a store prop, an
 * AlertProvider component with a template prop and options spread as props, a BrowserRouter component,
 * and a div with class "h-full w-full flex flex-col" containing a Navbar component, a Routing
 */
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
            <div className="w-full h-full flex flex-col">
              <Navbar />
              <Routing />
              <Footer  fromAdmin={true}/>
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
