import React, { useEffect } from 'react'
import { useState } from 'react'
import ContentElement from './ContentElement'

function RenderContentList({ contentList, actual }) {
    const [ListOfContent, setListOfContent] = useState([])
    /* This `useEffect` hook is setting the state of `ListOfContent` to the value of `contentList`
    whenever `contentList` changes. It is essentially updating the state of the component whenever
    the `contentList` prop changes. */
    useEffect(() => {
        setListOfContent(contentList)
    }, [contentList])

    /**
     * This function removes an element from a list of content in React.
     */
    const removeElement = (element) => {
        let helper = ListOfContent.filter((content) => {
            return (element.id != content.id)
        })
        setListOfContent(helper)
    }
    /* This is a `useEffect` hook that listens for the `removedMessage` event on the `actual.channel`
    object. When this event is triggered, the callback function passed to `listen` will be executed.
    The `useEffect` hook is set up to only run when the `actual.channel` object changes, as
    indicated by the dependency array `[actual.channel]`. */
    useEffect(() => {
        actual.channel.listen('removedMessage', (e) => {

        })
    }, [actual.channel])
    return (
        <div className='w-full' style={{
            WebkitColumnCount: 3, MozColumnCount: 3, columnCount: 3,
            WebkitColumnWidth: "33%", MozColumnWidth: "33%", columnWidth: "33%"
        }}>
            {
                ListOfContent.map((content) => {
                    return <ContentElement content={content} key={content.id} removeElement={removeElement} />
                })
            }
        </div>
    )
}

export default RenderContentList
