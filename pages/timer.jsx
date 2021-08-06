import { useEffect, useState } from 'react'
import { format, millisecondsToHours, millisecondsToMinutes, millisecondsToSeconds } from 'date-fns'
import { useIdleTimer } from 'react-idle-timer'

const TimerWithHook = () => {
  const waiting = 5000
  const timeout = 15000
  const [isWaiting, setIsWaiting] = useState(true)

  const [remaining, setRemaining] = useState(waiting)
  const [elapsed, setElapsed] = useState(0)
  const [lastActive, setLastActive] = useState(+new Date())
  const [lastEvent, setLastEvent] = useState('Events Emitted on Leader')
  const [leader, setLeader] = useState(true)

  const handleOnActive = () => setLastEvent('active')
  // const handleOnIdle = () => setLastEvent('idle')
  const handleOnIdle = () => {
    setLastEvent('idle')
    // setRemaining(timeout)
    setIsWaiting(false)
  }

  const {
    reset,
    pause,
    resume,
    getRemainingTime,
    getLastActiveTime,
    getElapsedTime,
    isIdle,
    isLeader
  } = useIdleTimer({
    timeout: isWaiting ? waiting : timeout,
    onActive: handleOnActive,
    onIdle: handleOnIdle,
    stopOnIdle: true,
    capture: false,
    events: [],
    crossTab: {
      emitOnAllTabs: true
    }
  })

  const handleReset = () => reset()
  const handlePause = () => pause()
  const handleResume = () => resume()

  useEffect(() => {
    setRemaining(getRemainingTime())
    setLastActive(getLastActiveTime())
    setElapsed(getElapsedTime())

    setInterval(() => {
      setRemaining(getRemainingTime())
      setLastActive(getLastActiveTime())
      setElapsed(getElapsedTime())
      setLeader(isLeader())
    }, 1000)
  }, [])

  const ms = 1.25 * 60 * 60 * 1000

  return (
    <div className="p-6 text--xl antialiased">
      <div>
        <h1>Timeout: {timeout}ms</h1>
        <h1>Time Remaining: {remaining}</h1>
        <h1>Time Elapsed: {elapsed}</h1>
        <h1>Last Active: {format(lastActive, 'd MMM yyyy HH:MM:ss.SSS')}</h1>
        <h1>Last Event: {lastEvent}</h1>
        <h1>Is Leader: {leader.toString()}</h1>
        <h1>Idle: {isIdle().toString()}</h1>
      </div>
      <div className="my-4">
        <button onClick={handleReset}>RESET</button>
        <button onClick={handlePause}>PAUSE</button>
        <button onClick={handleResume}>RESUME</button>
      </div>
      <div className="my-4">
        <p>MS: {ms} {millisecondsToHours(ms)} {millisecondsToMinutes(ms)} {millisecondsToSeconds(ms)}</p>
        <Timer ms={remaining} />
        <Timer ms={elapsed} />
      </div>
    </div>
  )
}

export default TimerWithHook

const Timer = ({ ms }) => {
  const [hours, setHours] = useState('--')
  const [minutes, setMinutes] = useState('--')
  const [seconds, setSeconds] = useState('--')

  useEffect(() => {
    const h = '' + Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const m = '' + Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const s = '' +  Math.floor((ms % (1000 * 60)) / 1000)
    setHours(h.padStart(2, 0))
    setMinutes(m.padStart(2, 0))
    setSeconds(s.padStart(2, 0))
  }, [ms])

  return <p>{hours}:{minutes}:{seconds}</p>
}