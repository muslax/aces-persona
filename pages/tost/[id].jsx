import { useEffect, useState } from "react"
import Head from "next/head"

import { ROUTES } from "config/routes"
import { connect } from "lib/database"

import { ACES_DB, COLLECTION, BATCHTEST } from "config/constants"
import useUser from "hooks/useUser"
import useBatchInfo from "hooks/useBatchInfo"

import TestLayout from "components/layout/TestLayout"
import Workbook from "components/workbook/Workbook"
import UnauthorizedTest from "components/UnauthorizedTest"

// Halaman ini HANYA dapat diakses bila
// - batch.testStatus == READY
// - user.workingOn == null
// - OR user.workingOn == module._id

const TestPage = ({ module }) => {
  const { user, isLoading, mutateUser } = useUser()
  const { data: batch, isError: batchError, isLoading: batchLoading, mutate: mutateBatch } = useBatchInfo(user.bid, user.gid)

  const [granted, setGranted] = useState(false)

  useEffect(() => {
    if (user && user.workingOn == module._id) setGranted(true)
  }, [user, module])

  if (isLoading || batchLoading) return null;

  if (batch.testStatus != BATCHTEST.READY) return (
    <p className="p-6 text-center">BATCH NOT READY</p>
  )

  if (!user.workingOn) return (
    <UnauthorizedTest ms={500} />
  )

  // if (!granted) return <UnauthorizedTest ms={20} />

  return <>
    <div>
      <Head>
        <title>ACES - {module.type}</title>
      </Head>

      {/* <p>Assignment: {user.workingOn}</p> */}

      <Workbook
        user={user}
        mutateUser={mutateUser}
        batch={batch}
        module={module}
      />
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
