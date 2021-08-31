import { useState } from "react"
import Timer from "react-compound-timer/build"

const UnauthorizedTest = ({ ms = 1000 }) => {
  const [time, setTime] = useState(ms)

  return <>
    <Timer
      initialTime={ms}
      direction="backward"
      checkpoints={[{
        time: 0,
        callback: () => setTime(0)
      }]}
    />
    {time === 0 && <p className="p-6 text-center">NOT CURRENT ASSIGNMENT</p>}
  </>
}

export default UnauthorizedTest
