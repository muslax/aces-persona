import { useRouter } from "next/router";

import API from "config/api";
import { API_ROUTES } from "config/routes";
import fetchJson from "lib/fetchJson";
import { generatePOSTData } from "lib/utils";

const TestHeader = ({ user, mutateUser, module }) => {
  const router = useRouter()

  async function closeTest(e) {
    // const url = `/api/post?q=${API.POST.CLOSE_TEST}`
    await fetchJson(API_ROUTES.POST.CLOSE_TEST, generatePOSTData({
      id: module._id,
      type: module.type,
    }))

    mutateUser()
    router.push(`/persona`);
  }
  return <>
    {/* <div className="h-8"></div> */}
    <div className="bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="py-4 px-5">
          <p className="font-bold">{user.project} - {user.client}</p>
          <p className="font-bold">{user.client}</p>
          <p className="font-bold">{user.fullname}</p>
          <p className="font-bold">{module.title} - {module.maxTime / 60000} menit</p>
          <p className="mb-3">Sisa waktu</p>
        </div>
      </div>
    </div>
  </>
}

export default TestHeader
