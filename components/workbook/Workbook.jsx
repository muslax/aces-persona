import { useEffect, useState } from "react"
import { useRouter } from "next/router"

import { SELFTEST } from "config/constants"
import { API_ROUTES, ROUTES } from "config/routes"
import fetchJson from "lib/fetchJson"
import { generatePOSTData } from "lib/utils"
import useTestProgress from "hooks/useTestProgress"

import Header from "./Header"
import Introduction from "./Intoduction"
import Selftest from "./Selftest"
import Timeout from "./Timeout"
import Finished from "./Finished"

const Workbook = ({ user, batch, module }) => {
  const router = useRouter()
  const { progress, isError, isLoading, mutateProgress } = useTestProgress(module.type);

  const [testSession, setTestSession] = useState(SELFTEST.INTRO)

  useEffect(() => {
    if (!progress) return

    // If finished or timeout, just remove localStorage
    // and set session accordingly
    if (progress.finished < 0) { // timeout
      setTestSession(SELFTEST.TIMEOUT)
      window.localStorage.removeItem(user._id)
      return
    } else if (progress.length == progress.done) { // finished
      setTestSession(SELFTEST.FINISHED)
      window.localStorage.removeItem(user._id)
      return
    }

    const id = progress.moduleId
    const netTime = progress.netTime

    if (null == window.localStorage.getItem(user._id)) {
      // Create store
      const obj = {};
      // obj[id] = { elapsed: netTime }
      obj[id] = { lastSession: SELFTEST.INTRO, elapsed: netTime }
      window.localStorage.setItem(user._id, JSON.stringify(obj))
      setTestSession(SELFTEST.INTRO)
      return
    } else {
      const store = JSON.parse(window.localStorage.getItem(user._id))
      if (!store[id]) {
        store[id] = { lastSession: SELFTEST.INTRO, elapsed: netTime }
        window.localStorage.setItem(user._id, JSON.stringify(store))
        setTestSession(SELFTEST.INTRO)
      } else {
        if (store[id]?.lastSession == SELFTEST.SELFTEST) {
          setTestSession(SELFTEST.SELFTEST)
        }
      }
    }


    // if (progress.done == 0) {
    //   const obj = {};
    //   obj[id] = { lastSession: SELFTEST.INTRO, elapsed: netTime }
    //   window.localStorage.setItem(user._id, JSON.stringify(obj))
    //   setTestSession(SELFTEST.INTRO)
    // } else if (progress.done >= 0) {
    //   const lastSession = store[id].lastSession
    //   if (lastSession == SELFTEST.TIMEOUT || lastSession == SELFTEST.FINISHED) {
    //     setTestSession(SELFTEST.INTRO)
    //     store[id].lastSession = SELFTEST.INTRO
    //     window.localStorage.setItem(user._id, JSON.stringify(store))
    //   }
    // }
  }, [user, progress])

  function ef2() {
    if (!progress) return

    const id = progress.moduleId
    const netTime = progress.netTime

    if (window.localStorage.getItem(user._id) == null) {
      // Create store
      const obj = {};
      obj[id] = { lastSession: SELFTEST.INTRO, elapsed: netTime }
      window.localStorage.setItem(user._id, JSON.stringify(obj))
      setTestSession(SELFTEST.INTRO)
      return
    }

    const store = JSON.parse(window.localStorage.getItem(user._id))
    if (!store[id]) store[id] = { lastSession: SELFTEST.INTRO, elapsed: netTime }

    if (progress.finished < 0) { // timeout
      setTestSession(SELFTEST.TIMEOUT)
      window.localStorage.removeItem(user._id)
    } else if (progress.length == progress.done) { // finished
      setTestSession(SELFTEST.FINISHED)
      window.localStorage.removeItem(user._id)
    } else if (progress.done == 0) {
      const obj = {};
      obj[id] = { lastSession: SELFTEST.INTRO, elapsed: netTime }
      window.localStorage.setItem(user._id, JSON.stringify(obj))
      setTestSession(SELFTEST.INTRO)
    } else if (progress.done >= 0) {
      const lastSession = store[id].lastSession
      if (lastSession == SELFTEST.TIMEOUT || lastSession == SELFTEST.FINISHED) {
        setTestSession(SELFTEST.INTRO)
        store[id].lastSession = SELFTEST.INTRO
        window.localStorage.setItem(user._id, JSON.stringify(store))
      }
    }
  }

  function effect() {
    if (!progress) return

    const id = progress.moduleId
    const netTime = progress.netTime

    const rawStore = window.localStorage.getItem(user._id)
    if (rawStore == null) {
      // Create store
      const obj = {};
      obj[id] = { lastSession: SELFTEST.INTRO, elapsed: netTime }
      window.localStorage.setItem(user._id, JSON.stringify(obj))
    }

    const store = JSON.parse(window.localStorage.getItem(user._id))
    if (!store[id]) store[id] = { lastSession: SELFTEST.INTRO, elapsed: netTime }

    if (progress.finished < 0) store[id].lastSession = SELFTEST.TIMEOUT
    if (progress.length == progress.done) store[id].lastSession = SELFTEST.FINISHED
    if (progress.done > 0 && progress.done < progress.length) store[id].lastSession = SELFTEST.SELFTEST //SELFTEST.SELFTEST

    window.localStorage.setItem(user._id, JSON.stringify(store))

    const lastSession = store[id].lastSession
    if (lastSession == SELFTEST.FINISHED || lastSession == SELFTEST.TIMEOUT) {
    // if (lastSession != SELFTEST.INTRO) {
      setTestSession(lastSession)
    }
  }



  // Start test, start timer countdown
  async function startTest(e) {
    try {
      await fetchJson(API_ROUTES.POST.START_TEST, generatePOSTData({
        type: module.type,
        id: progress._id,
      }))

      mutateProgress()
      setTestSession(SELFTEST.SELFTEST)
    } catch (error) {
      alert("SERVER ERROR")
    }
  }

  async function continueTest(e) {
    try {
      await fetchJson(API_ROUTES.POST.CONTINUE_TEST, generatePOSTData({
        type: module.type,
        id: progress._id,
      }))

      mutateProgress()
      setTestSession(SELFTEST.SELFTEST)
    } catch (error) {
      alert("SERVER ERROR")
    }
  }

  async function closeTest(e) {
    try {
      const response = await fetchJson(API_ROUTES.POST.CLOSE_TEST, generatePOSTData({
        type: module._id,
        id: progress._id,
      }))

      if (response) router.push(ROUTES.Persona)
    } catch (error) {
      alert("SERVER ERROR")
    }
  }

  async function forceFinishTest(e) {
    try {
      await fetchJson(API_ROUTES.POST.FORCE_FINISH_TEST, generatePOSTData({
        type: module.type,
        id: progress._id,
      }))

      mutateProgress()
      setTestSession(SELFTEST.TIMEOUT)
      const store = JSON.parse(window.localStorage.getItem(user._id))
      store[module._id].lastSession = SELFTEST.TIMEOUT
      window.localStorage.setItem(user._id, JSON.stringify(store))
    } catch (error) {
      alert("SERVER ERROR")
    }
  }

  if (isLoading) return null;

  return <>
    <Header user={user} module={module} />

    <div className="max-w-5xl mx-auto py-5">
      <div className="px-5">
        {testSession == SELFTEST.INTRO && (
          <Introduction
            user={user}
            module={module}
            done={progress.done}
            startTest={startTest}
            continueTest={continueTest}
            closeTest={closeTest}
          />
        )}
        {testSession == SELFTEST.SELFTEST && (
          <Selftest
            user={user}
            module={module}
            progress={progress}
            mutateProgress={mutateProgress}
            onTimeout={forceFinishTest}
            closeTest={closeTest}
          />
        )}
        {testSession == SELFTEST.TIMEOUT && (
          <Timeout
            time={5000}
            callback={closeTest}
          />
        )}
        {testSession == SELFTEST.FINISHED && (
          <Finished
            time={5000}
            callback={closeTest}
          />
        )}

        <div className="flex items-start space-x-5">
          <pre className="w-48 flex-shrink-0">{JSON.stringify(progress, null, 2)}</pre>
          <pre className="">{JSON.stringify(module, null, 2)}</pre>
        </div>
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-5">

    </div>

  </>;
}

export default Workbook
