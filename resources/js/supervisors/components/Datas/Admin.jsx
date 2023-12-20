import React from 'react'
import { useAlert } from 'react-alert'
import { useSelector } from 'react-redux'
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import axios from 'axios';

/**
 * This is a React component that renders an admin's information and allows for their deletion, with
 * certain restrictions.
 * @returns A React component that displays information about an admin and allows for their removal,
 * with the actual removal functionality being handled by an axios delete request to an API endpoint.
 * The component also uses Redux's useSelector hook to get the ID of the currently logged in
 * supervisor, and the useAlert hook to display success or error messages.
 */
function AdminElement({ data, removingAdmin }) {
    const loggedInID = useSelector((state) => state.supervisor.id)
    const alerts = useAlert()
    /**
     * This function removes an admin from a list, but only if the admin is not the owner or the
     * currently logged in user.
     */
    const removeAdmin = () => {
        if (data.role != 2 && loggedInID != data.id) {
            axios.delete('/api/supervisors/admins/' + data.id).then(() => {
                removingAdmin(data.id)
                alerts.success("Admin deleted")
            }).catch((err) => {
                alerts.error("Something went wrong")
                console.log(err)
            })
        } else {
            alerts.error("You can not remove any owner or your self!")
        }
    }
    return (
        <div className="flex items-center justify-center border-b border-gray-200 py-4">
            <div className="flex items-center">
                <span className="font-medium text-gray-200 mr-4">
                    {data.tag}
                </span>
                <span className="text-sm text-white mr-4">
                    {data.firstName} {data.middleName ?? ' '}{data.lastName}
                </span>
                <span className="text-sm text-white">
                    {data.role != 2 ? 'Admin' : 'Owner'}
                </span>
            </div>
            <button className="ml-4" disabled={loggedInID == data.id || data.role == 2} onClick={() => { removeAdmin() }}>
                <DeleteForeverTwoToneIcon />
            </button>
        </div>
    )
}

export default AdminElement