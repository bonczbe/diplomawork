import React from 'react'
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import NotificationImportantTwoToneIcon from '@mui/icons-material/NotificationImportantTwoTone';

/**
 * This is a React component that renders a button with either a notification icon or an important
 * notification icon based on whether there are any unread alerts.
 */
function AlertsOnNavBarIsUnreaded({ alertsUnSeen, negalTheAlertOpened }) {
  return (
    <button className='w-fit px-3' onClick={negalTheAlertOpened}>
      {
        (alertsUnSeen) ? (
          <NotificationImportantTwoToneIcon />
        ) : (
          <NotificationsTwoToneIcon />
        )
      }
    </button>
  )
}



export default AlertsOnNavBarIsUnreaded





