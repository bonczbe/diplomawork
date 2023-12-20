import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import { useSelector } from 'react-redux';
import ReportElement from './ReportElement';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';

function Reports() {
  const loggedInID = useSelector((state) => state.supervisor.id);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loadingNews, setLoadingNews] = useState(false);
  const [sendingResponse, setSendingResponse] = useState(false);
  const alerst = useAlert()
  const [cards, setCards] = useState([])

 /**
  * The function handles swiping left or right on a card and sends a corresponding API request, then
  * updates the current card index.
  */
  const handleSwipe = (direction) => {
    if (currentCardIndex < cards.length && loggedInID > 0) {
      setSendingResponse(true)
      if (direction == "left") {
        axios.post('/api/supervisors/reports/notContent', {
          outsideID: cards[currentCardIndex].props.data.outsideID,
          type: cards[currentCardIndex].props.data.type,
          userID: loggedInID
        }).then((res) => {
          indexStepper()
        }).catch((err) => {
          indexStepper()
          console.log(err)
        })
      } else {
        axios.post('/api/supervisors/reports/content', {
          outsideID: cards[currentCardIndex].props.data.outsideID,
          type: cards[currentCardIndex].props.data.type,
          userID: loggedInID
        }).then((res) => {
          indexStepper()
        }).catch((err) => {
          indexStepper()
          console.log(err)
        })
      }
    } else {
      alerst.info("Loading the new reports...")
    }
  };
 /**
  * This function updates the current card index and sets loading news to true if the current card
  * index is equal to the length of the cards array.
  */
  const indexStepper = () => {
    if (currentCardIndex + 1 == cards.length) {
      setLoadingNews(true)
    } else {
      setCurrentCardIndex(currentCardIndex + 1)
    }
    setSendingResponse(false)
  }

  /* This is a React hook called `useEffect` that is used to perform side effects in a functional
  component. In this case, it is fetching all reports from the server using an HTTP GET request when
  the `loggedInID` variable changes. The fetched data is then mapped to an array of `ReportElement`
  components and set as the state of the `cards` variable using the `setCards` function. The `catch`
  block logs any errors that occur during the HTTP request. */
  useEffect(() => {
    if (loggedInID > 0) {
      axios.get('/api/supervisors/reports/allReports').then((res) => {
        setCards(res.data.map((thing) => {
          return <ReportElement data={thing} />
        })
        )
      }).catch((err) => {
        console.log(err)
      })
    }
  }, [loggedInID])

  /* This is a React hook called `useEffect` that is used to perform side effects in a functional
  component. In this case, it is fetching additional reports from the server using an HTTP GET
  request when the `loadingNews` variable changes. The fetched data is then added to the existing
  `cards` array using the spread operator and the `setLoadingNews` function is called to set
  `loadingNews` to `false`. The `catch` block logs any errors that occur during the HTTP request. */
  useEffect(() => {
    if (loadingNews) {
      axios.get('/api/supervisors/reports').then((res) => {

        cards = [
          ...cards,
          ...res.data
        ]
        setLoadingNews(false)

      }).catch((err) => {
        console.log(err)
      })
    }
  }, [loadingNews])

  return (
    <div className='w-full h-full'>
      <div className='w-full h-3/4 flex justify-center'>
        <div className='w-9/12 h-full block'>
          {
            (loadingNews == true || sendingResponse == true) ? (
              <span>
                Loading...
              </span>
            ) : (
              <div className='w-full h-full py-3' key={currentCardIndex + "" + loadingNews}>
                {(cards.length > 0 && !loadingNews) ? cards[currentCardIndex] : "There are no more available Reports..."}
              </div>
            )
          }
        </div>
      </div>
      {(cards.length > 0 && !loadingNews) && <div className="w-full flex justify-center">
        <button className="flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-700 mr-2" onClick={() => handleSwipe("left")}>
          <DeleteIcon />
          Delete
        </button>
        <button className="flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-500 hover:bg-green-700" onClick={() => handleSwipe("right")}>
          <CheckIcon />
          Keep
        </button>
      </div>}
    </div>
  );
}

export default Reports;
