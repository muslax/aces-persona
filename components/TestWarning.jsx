import { useEffect, useState } from "react"
import { useIdleTimer } from "react-idle-timer"

const TestWarning = ({ batchInfo, callback }) => {
  const [remaining, setRemaining] = useState(batchInfo.waitingTime)

  const handleOnIdle = () => {
    callback(true)
  }

  const { getRemainingTime } = useIdleTimer({
    timeout: batchInfo.waitingTime,
    stopOnIdle: true,
    onIdle: handleOnIdle,
    events: [],
    crossTab: { emitOnAllTabs: true },

  })

  useEffect(() => {
    setRemaining(getRemainingTime())

    setInterval(() => {
      setRemaining(getRemainingTime())
    }, 1000)
  }, [getRemainingTime])

  if (batchInfo.waitingTime == 0 || remaining == 0) return (
    <p className="font-bold mb-2">Anda dapat mulai mengerjakan sekarang.</p>
  )

  return (
    <p className="font-bold mb-2">
      <span className="mr-3">Anda dapat mulai mengerjakan dalam waktu:</span>
      <Timer ms={remaining} />
    </p>
  )
}

export default TestWarning

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

  return <span>{hours}:{minutes}:{seconds}</span>
  // return <span>{minutes} menit</span>
}
