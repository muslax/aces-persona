import CompoundTimer from 'react-compound-timer'

import TestHeader from "components/TestHeader"
import GPQIntro from './GPQIntro'
import { SELFTEST } from 'config/constants'

const GPQTemplate = ({
  user,
  mutateUser,
  module,
  progress,
  testSession,
  startTest,
  continueTest,
  cancelTest,
  finishTest,
  forceFinishTest,
}) => {

  function handleOnIdle() {

  }

  return <>
    <div className="text-center h--10 py-3">
      <Countdown maxTime={module.maxTime} onIdle={handleOnIdle} />
    </div>
    <TestHeader user={user} mutateUser={mutateUser} module={module} />
    {/* main */}
    <main className="max-w-5xl mx-auto">
      <div className="py-4 px-5">
        <div className="buttons mb-4">
          <button
            className="border px-4 py-1 mr-4"
            onClick={startTest}
          >Start Test</button>
          <button
            className="border px-4 py-1 mr-4"
            onClick={cancelTest}
          >Cancel Test</button>
          <button
            className="border px-4 py-1 mr-4"
            onClick={finishTest}
          >Finish Test</button>
          <button
            className="border px-4 py-1 mr-4"
            onClick={forceFinishTest}
          >Force Finish Test</button>
        </div>

        <div className="test-content">
          {testSession == SELFTEST.INTRO && <GPQIntro startTest={startTest} cancelTest={cancelTest} />}
        </div>

        <pre>{JSON.stringify(progress, null, 2)}</pre>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <pre>{JSON.stringify(module, null, 2)}</pre>
      </div>
    </main>
  </>
}

export default GPQTemplate

const Countdown = ({ maxTime, onIdle }) => {
  return (
    <span className="font-bold">
      <CompoundTimer
        initialTime={maxTime}
        startImmediately={false}
        direction="backward"
        lastUnit="h"
        formatValue={n => ('' + n).padStart(2,0)}
        checkpoints={[{
          time: 0,
          callback: () => onIdle()
        }]}
      >
        {({ start, resume, pause, stop, reset, timerState }) => (
          <div>
            <button onClick={start} className="">Start</button>
            <CompoundTimer.Hours />:<CompoundTimer.Minutes />:<CompoundTimer.Seconds />
          </div>
        )}

      </CompoundTimer>
    </span>
  )
}