import { SELFTEST } from "config/constants"
import GPQIntro from "components/gpq/GPQIntro"
import Continue from "./Continue"

const Introduction = ({ user, module, done, startTest, continueTest, closeTest }) => {
  // const store = JSON.parse(window.localStorage.getItem(user._id))
  // if (store && store[module._id]?.lastSession == SELFTEST.SELFTEST) return (
  //   <Continue time={5000} continueTest={continueTest} closeTest={closeTest} />
  // )

  function getWorkbookIntro(module) {
    return <GPQIntro startTest={startTest} closeTest={closeTest} />
  }

  if (done > 0) return (
    <div className="text-center">
      <p className="text-center font-bold">Anda sudah mengerjakan hingga nomor {done}</p>
      <button
        className="border px-4 py-1 mr-4"
        onClick={continueTest}
      >Lanjutkan</button>
      <button
        className="border px-4 py-1 mr-4"
        onClick={closeTest}
      >Cancel Test</button>
    </div>
  )

  return <>{getWorkbookIntro()}</>
}

export default Introduction
