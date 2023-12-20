import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { useSelector } from "react-redux";

function ReportButton({ fromWhere, setterReportedByUser, outsideID }) {
  const alerts = useAlert();
  const loggedInID = useSelector((state) => state.user.id);
  const [loading, setLoading] = useState(true)
  const [dataFromFetch, setDataFromFetch] = useState([])
  useEffect(() => {
    if (loggedInID > 0) {
      axios.get('/api/reports/' + outsideID + '/' + loggedInID + '/' + fromWhere).then((res) => {
        setDataFromFetch(res.data)
        if(res.data&&res.data.exist&&res.data.exist.userID==loggedInID){
          setterReportedByUser(true)
        }
        setLoading(false)
      }).catch((err) => {
        console.log(err)
      })
    }
  }, [loggedInID])
  const updateReports = () => {
    if ((fromWhere == "profilePic" || fromWhere == "wallPaper") && outsideID == 1) {
      alerts.info("Default picture can not be reported! 😎")
    } else {
      axios.post("/api/reports/new", {
        outsideID: outsideID,
        type: fromWhere,
        userID: loggedInID,
      })
        .then((res) => {
          setterReportedByUser(true)
          setDataFromFetch({ ...dataFromFetch, exist: res.data })
        })
        .catch((err) => {
          console.log(err);
          alerts.error("Something went wrong");
        });
    }
  };
  return (
    <button onClick={() => { updateReports() }} disabled={(loading == true)}>
      Report
    </button>
  );
}

export default ReportButton;
