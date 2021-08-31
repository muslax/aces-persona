import { useEffect, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"

import { ROUTES } from "config/routes"
import { connect } from "lib/database"

import { ACES_DB, COLLECTION, BATCHTEST } from "config/constants"
import useUser from "hooks/useUser"
import useBatchInfo from "hooks/useBatchInfo"

import TestLayout from "components/layout/TestLayout"
import TestHeader from "components/TestHeader"
import Selftest from "components/Selftest"
import GPQTemplate from "components/gpq/GPQTemplate"
import UnauthorizedTest from "components/UnauthorizedTest"

// Halaman ini HANYA dapat diakses bila
// - batch.testStatus == READY
// - user.workingOn == null
// - OR user.workingOn == module._id

const TestPage = ({ module }) => {
  const router = useRouter()
  const { user, isLoading, mutateUser } = useUser()
  const { data: batchInfo, isError: batchError, isLoading: batchLoading, mutate: mutateBatch } = useBatchInfo(user.bid, user.gid)

  const [accessStatus, setAccessStatus] = useState(null)

  useEffect(() => {
    if (user.workingOn == module._id) setAccessStatus('OK')
    else setAccessStatus("NOT_OK")
  }, [user, module])

  if (isLoading || batchLoading) return null;

  // if (!user || !module) return null;

  if (user && user.workingOn != router.query.id) return <UnauthorizedTest ms={500} />

  if (batchInfo.testStatus != BATCHTEST.READY) return (
    <p className="p-6 text-center">PAGE NOT FOUND</p>
  )

  return <>
    <div>
      <Head>
        <title>ACES - {module.type}</title>
      </Head>

      <Selftest user={user} mutateUser={mutateUser} batch={batchInfo} module={module} />
    </div>
  </>
}

TestPage.suppressFirstRenderFlicker = false
TestPage.redirectUnAuthenticatedTo = ROUTES.Home
// eslint-disable-next-line react/display-name
TestPage.getLayout = (page) => <TestLayout>{page}</TestLayout>
export default TestPage

export async function getStaticPaths() {
  const { client } = await connect()
  const db = client.db(ACES_DB)
  const modules = await db.collection(COLLECTION.Modules).find().toArray()
  const paths = modules.map(module => ({
    params: { id: module._id, type: module.type }
  }))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { client } = await connect()
  const db = client.db(ACES_DB)
  const module = await db.collection(COLLECTION.Modules).findOne({ _id: params.id })

  return {
    props: {
      module,
    },
    revalidate: 60, // 60 seconds
  }
}
