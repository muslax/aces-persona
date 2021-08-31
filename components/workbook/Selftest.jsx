import { SELFTEST } from "config/constants"
import { API_ROUTES } from "config/routes"
import fetchJson from "lib/fetchJson"
import { generatePOSTData } from "lib/utils"
import { useEffect } from "react"

import Timer from "./Timer"

const Selftest = ({ user, module, progress, mutateProgress, onTimeout,closeTest }) => {
  const store = JSON.parse(window.localStorage.getItem(user._id))
  store[module._id].lastSession = SELFTEST.SELFTEST
  window.localStorage.setItem(user._id, JSON.stringify(store))

  useEffect(() => {
    const t = setInterval(() => {
      const store = JSON.parse(window.localStorage.getItem(user._id))
      let elapsed = store[module._id].elapsed
      store[module._id].elapsed = elapsed + 1000
      window.localStorage.setItem(user._id, JSON.stringify(store))
    }, 1000)

    return () => clearInterval(t)
  })

  function getRemainingTime() {
    const store = JSON.parse(window.localStorage.getItem(user._id))
    const elapsed = store[module._id].elapsed
    return progress.maxTime - elapsed + 2000
  }

  async function saveAndContinue(e) {
    const body = {
      id: progress._id,
      type: module.type,
      length: module.length,
      seq: progress.done + 1,
      // TODO:
      // Check bookSeq generation
      bookSeq: progress.done + 1,
      content: "Type dependent",
      lastTouched: progress.touched,
    }
    try {
      const response = await fetchJson(
        API_ROUTES.POST.SAVE_TEST_ITEM,
        generatePOSTData(body)
      )
      console.log(response)
      mutateProgress()
    } catch (error) {
      alert('SERVER ERROR')
    }
  }

  function getWorkbookTemplate() {

  }

  return <>
    <div className="flex">
      <div className="flex-grow">
        <h3 className="font-bold">Test Item</h3>
      </div>
      <div className="">
        <Timer
          remaining={getRemainingTime()}
          onTimeout={onTimeout}
        />
      </div>
    </div>
    <div className="">
      <p>TEST ITEM CONTENT</p>
      <button
        className="border px-4 py-1 mr-4"
        onClick={saveAndContinue}
      >Save&nbsp;{progress.done + 1}</button>
      <button
        className="border px-4 py-1 mr-4"
        onClick={closeTest}
      >CLose</button>
    </div>
  </>
}

export default Selftest
