import React, { useState } from 'react'
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
/* This is a functional component in JavaScript React that renders uploaded content. It takes in three
props: `item`, `RemoveFromList`, and `isHistories`. */

function UploadedContent({ item, RemoveFromList, isHistories }) {
    const [onMouse, setOnMouse] = useState(false)
    return (
        <div key={item.url} className='w-fit h-32 mx-2 float-left min-w-fit' onMouseEnter={() => { setOnMouse(true) }} onMouseLeave={() => { setOnMouse(false) }}>
            <div className='relative'>
                {
                    (onMouse) ? <button className='absolute rounded-full bg-white z-[101]' onClick={() => { RemoveFromList(item) }}>
                        <HighlightOffTwoToneIcon />
                    </button> : null
                }
            </div>
            {
                (item.image.name.endsWith('.jpeg') || item.image.name.endsWith('.png') || item.image.name.endsWith('.jpg') || item.image.name.endsWith('.gif')) ? (
                    <img key={item.url} className={'w-fit ' + ((isHistories) ? "h-20" : "h-32")} src={item.url} alt={item.image.name} />
                ) : (
                    <video className={'w-fit ' + ((isHistories) ? "h-20" : "h-32")} key={item.url}>
                        <source src={item.url} />
                        Video Format not supported!
                    </video>
                )
            }

        </div>
    )
}

export default UploadedContent
