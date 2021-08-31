import Link from "next/link"

import fetchJson from "lib/fetchJson"
import { generatePOSTData } from "lib/utils"

import { BATCHTEST } from "config/constants"
import { useRouter } from "next/router"
import API from "config/api"

const UserTests = ({ user, status, progress, modules, setSubmitting }) => {
  const router = useRouter()

  async function initTest(e, module) {
    e.preventDefault()
    setSubmitting(true)

    // Do nothing when user is working on other test
    if (user.workingOn && user.workingOn != module._id) return false;

    const url = `/api/post?q=${API.POST.INIT_TEST}`
    await fetchJson(url, generatePOSTData({
      id: module._id,
      type: module.type,
    }))

    router.push(`/test/${module._id}`);
  }

  if (status == BATCHTEST.READY) {
    return <>
      {progress.map(test => (
        <p key={test.mid} className="mb-2">
          <Link href={`/test/${test.mid}`}>
            <a onClick={e => initTest(e, modules[test.mid])} className="text-blue-500">{modules[test.mid].title}</a>
          </Link>
        </p>
      ))}
    </>
  }

  return <>
    {progress.map(test => (
      <p key={test.mid} className="mb-2">{modules[test.mid].title}</p>
    ))}
  </>
}

export default UserTests
