import axios from 'axios';

/**
 * It fetches data from the server and changes the state of the component.
 * </code>
 */
export function indexByActions(place, id, typeofdata, changeUserActions, setFetched) {
    switch (true) {
        case ("normalPost" === place && (typeofdata == "Post" || typeofdata == "Comment" || typeofdata == "Reply")):
            axios.get("/api/postaction/all/groupBy/" + id + "/" + typeofdata).then((response) => {
                changeUserActions(response.data, setFetched)
            }).catch((err) => {
                console.log({ "code": err.statusCode, "message": err.message })
            })
            break;
        case ("pagePost" === place && (typeofdata == "Post" || typeofdata == "Comment" || typeofdata == "Reply")):
            axios.get("/api/pagepostreaction/all/groupBy/" + id + "/" + typeofdata).then((response) => {
                changeUserActions(response.data, setFetched)
            }).catch((err) => {
                console.log({ "code": err.statusCode, "message": err.message })
            })
            break;
        case ("groupPost" === place && (typeofdata == "Post" || typeofdata == "Comment" || typeofdata == "Reply")):
            axios.get("/api/grouppostreaction/all/groupBy/" + id + "/" + typeofdata).then((response) => {
                changeUserActions(response.data, setFetched)
            }).catch((err) => {
                console.log({ "code": err.statusCode, "message": err.message })
            })
            break;
        default:
            break;
    }
}
/**
 * It's a function that takes in a few parameters and then makes an axios call to the server to get
 * some data.
 */
export function userActiveAction(place, userID, outdideID, typeofdata, changeUserActions, setUserAction) {
    switch (true) {
        case ("normalPost" === place && (typeofdata == "Post" || typeofdata == "Comment" || typeofdata == "Reply")):
            axios.get("/api/postaction/userAction/" + userID + "/" + outdideID + "/" + typeofdata).then((response) => {

                changeUserActions(response.data, setUserAction)
            }).catch((err) => {
                console.log({ "code": err.statusCode, "message": err.message })
            })
            break;
        case ("pagePost" === place && (typeofdata == "Post" || typeofdata == "Comment" || typeofdata == "Reply")):
            axios.get("/api/pagepostreaction/userAction/" + userID + "/" + outdideID + "/" + typeofdata).then((response) => {

                changeUserActions(response.data, setUserAction)
            }).catch((err) => {
                console.log({ "code": err.statusCode, "message": err.message })
            })
            break;
        case ("groupPost" === place && (typeofdata == "Post" || typeofdata == "Comment" || typeofdata == "Reply")):
            axios.get("/api/grouppostreaction/userAction/" + userID + "/" + outdideID + "/" + typeofdata).then((response) => {

                changeUserActions(response.data, setUserAction)
            }).catch((err) => {
                console.log({ "code": err.statusCode, "message": err.message })
            })
            break;
        default:
            break;
    }
}
