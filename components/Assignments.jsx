import Link from "next/link"

import fetchJson from "lib/fetchJson"
import { generatePOSTData } from "lib/utils"

import { BATCHTEST } from "config/constants"
import { useRouter } from "next/router"
import API from "config/api"
import useAssignments from "hooks/useAssignments"

const Assignments = ({ user, batch, modules, setSubmitting}) => {
  const router = useRouter()
  const { assignments, isError, isLoading, mutateAssignments } = useAssignments();

  async function initTest(e, module) {
    e.preventDefault()

    if (user.workingOn == module._id) {
      router.push(`/tost/${module._id}`);
    } else {
      setSubmitting(true)
      try {
        const url = `/api/post?q=${API.POST.INIT_TEST}`
        const response = await fetchJson(url, generatePOSTData({
          id: module._id,
          type: module.type,
        }))

        // if (response) router.push(`/tost/${module._id}`);
        // Give 500ms waiting for user mutation
        setTimeout(() => router.push(`/tost/${module._id}`), 500)

        // Mutate first, then reroute -> CAUSE FLICKER
        // await mutateUser(fetchJson(url, generatePOSTData({
        //   id: module._id,
        //   type: module.type,
        // })))
        // router.push(`/tost/${module._id}`);
      } catch (error) {
        alert("ERROR")
      }
    }
  }

  function getAssignments() {
    let tests = []

    assignments.forEach(a => {
      const progress = a.progress
      const id = a.mid
      const text = modules[a.mid].title
      const href = `/tost/${a.mid}`
      const info = ''
      const item = { id, text, href, info, enabled: true }

      if (progress && progress.done == progress.length) {
        item.enabled = false
        item.info = `Done`
      } else if (progress && progress.finished < 0) {
        item.enabled = false
        item.info = `Timeout`
      }

      // If there's already an assignment
      if (user.workingOn && user.workingOn != a.mid) {
        item.enabled = false
      }

      tests.push(item)
    })

    if (!batch.order) return tests;

    const orderedTests = []
    let found = false
    tests.forEach(a => {
      const item = a
      if (found) {
        item.enabled = false
      } else {
        if (item.enabled) {
          found = true
        }
      }
      orderedTests.push(item)
    })

    return orderedTests
  }

  if (isLoading) return null;

  return (
    <div className="">
      {batch.testStatus != BATCHTEST.READY && <NotReady assignments={getAssignments()} />}

      {batch.testStatus == BATCHTEST.READY && (
      <table className="w-full border-t mb-5">
        <tbody>
        {getAssignments().map((a, index) => (
          <tr key={a.id} className="border-b">
            <td className="w-10 py-2">{index + 1}</td>
            <td className="h-12 py-2 pl-2 font-semibold">{a.text}</td>
            <td className="py-2 pl-2 text-right">
              {!a.enable && <>{a.info}</>}
              {a.enabled && a.id != user.workingOn && (
                <button
                className="rounded bg-green-500 text-white text-sm font-medium px-5 py-2"
                onClick={e => initTest(e, modules[a.id])}
                >Kerjakan</button>
              )}
            </td>
          </tr>
        ))}
        </tbody>
      </table>
      )}
      {/* <pre>{JSON.stringify(assignments, null, 2)}</pre> */}
    </div>
  )
}

export default Assignments

const NotReady = ({ assignments }) => {
  return (
    <table className="w-full border-t mb-5">
        <tbody>
        {assignments.map((a, index) => (
          <tr key={a.id} className="border-b">
            <td className="w-10 py-2">{index + 1}</td>
            <td className="h-12 py-2 pl-2 font-semibold">{a.text}</td>
            <td className="py-2 pl-2 text-right">{a.info}</td>
          </tr>
        ))}
        </tbody>
      </table>
  )
}