import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AccountCircle, Report } from '@mui/icons-material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ListFromOwnerChoosed from './ListFromOwnerChoosed';

function Owner() {
    const role = useSelector((state) => state.supervisor.role);
    const navigate = useNavigate();
    const [adminReports, setAdminsReport] = useState([-1]);
    const [numberOfCheckedReports, setNumberOfCheckedReports] = useState(0);
    const [numberOfUnCheckedReports, setNumberOfUnCheckedReports] = useState(0);
    const [numberOfUsers, setNumberOfUsers] = useState(0);

   /* `useEffect` is a hook in React that allows you to perform side effects in function components. In
   this code, `useEffect` is used to fetch data from the server and update the state variables
   `adminsReport`, `numberOfCheckedReports`, `checkedReports`, and `numberOfUsers` when the `role`
   variable changes. The `role` variable is obtained from the Redux store using the `useSelector`
   hook. If the `role` is not equal to 2, the user is redirected to the permission page using the
   `navigate` function from the `react-router-dom` library. The `useEffect` hook takes an array of
   dependencies as its second argument, which determines when the effect should be re-run. In this
   case, the effect will be re-run whenever the `role` variable changes. */
    useEffect(() => {
        if (role !== 2) {
            navigate('/supervisors/panel/permission');
        }
        axios
            .get('/api/supervisors/admins/infos')
            .then((res) => {
                setAdminsReport(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
            axios
                .get('/api/supervisors/reports/list/numberOfChecked')
                .then((res) => {
                    setNumberOfCheckedReports(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
                axios
                    .get('/api/supervisors/reports/list/numberOfUnChecked')
                    .then((res) => {
                        setNumberOfUnCheckedReports(res.data);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
        axios
            .get('/api/supervisors/numberOfUsers')
            .then((res) => {
                setNumberOfUsers(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [role]);
    return (
        <div className="flex flex-col gap-6 items-center">
            <div className="flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2">
                    <AccountCircle />
                    <div className="text-xl font-bold">{numberOfUsers}</div>
                    <div className="text-lg font-medium">Total Number of Users</div>
                </div>
                <div className="flex items-center gap-2">
                    <Report />
                    <div className="text-xl font-bold">{numberOfCheckedReports}</div>
                    <div className="text-lg font-medium">Total Number of Checked Reports</div>
                </div>
                <div className="flex items-center gap-2">
                    <AutorenewIcon />
                    <div className="text-xl font-bold">{numberOfUnCheckedReports}</div>
                    <div className="text-lg font-medium">Total Number of Unchecked Reports</div>
                </div>
            </div>
                <div className="text-lg font-medium">Admin Reports</div>

            <div className="w-full h-full">
                <ListFromOwnerChoosed key={adminReports} list={adminReports} type={"adminReports"} />
            </div>
        </div>
    );
}

export default Owner;
