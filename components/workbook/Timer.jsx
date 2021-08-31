import CompoundTimer from "react-compound-timer"

const Timer = ({ remaining, onTimeout, showTimer = true }) => {
  return (
    <CompoundTimer
      initialTime={remaining}
      startImmediately={true}
      direction="backward"
      lastUnit="h"
      formatValue={n => ('' + n).padStart(2,0)}
      checkpoints={[{
        time: 0,
        callback: () => onTimeout()
      }]}
    >
      <span></span>
      {showTimer && <>
        <CompoundTimer.Hours />
        :
        <CompoundTimer.Minutes />
        :
        <CompoundTimer.Seconds />
      </>}
    </CompoundTimer>
  )
}

export default Timer
