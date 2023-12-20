import React from 'react'

function Reaction({ type, total, activeType, changeReaction, removeReaction, loggedInId }) {
  function ReactionType() {
    switch (type) {
      case 'Star':
        return "⭐"
      case "Meh":
        return "🤨"
      case "Love":
        return "❤️"
      case "WOW":
        return "😯"
      case "Cry":
        return "😢"
      case "Laugh":
        return "😄"
      case "HeartBroken":
        return "💔"
      default:
        return ""
    }
  }
  return (
    <div className={'w-fit float-left leading-5'}>
      {
        <button onClick={() => { (type !== activeType) ? changeReaction(type) : removeReaction(type) }} disabled={(loggedInId > 0) ? false : true}>{ReactionType() + " " + total}</button>
      }
    </div>
  )
}

export default Reaction