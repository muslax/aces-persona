import { useEffect, useState } from "react"
import Link from 'next/link'
import CompoundTimer from 'react-compound-timer'

import { BATCHTEST } from "config/constants"
import useBatchInfo from "hooks/useBatchInfo"

import UserHeader from "./UserHeader"
import UserInfo from "./UserInfo"
import WorkingOn from "./WorkingOn"
import Assignments from "./Assignments"

const Persona = ({ modules, user, mutateUser }) => {
  const { data: batch, isError, isLoading, mutate: mutateBatch } = useBatchInfo(user.bid, user.gid)

  const [testStatus, setTestStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (batch) {
      setTestStatus(batch.testStatus)
    }
  }, [batch])

  const handleOnIdle = () => {
    mutateBatch()
  }

  if (isError) return <p>ERROR</p>

  if (isLoading) return <></>

  if (user.workingOn) return <WorkingOn user={user} mutateUser={mutateUser} />

  return (
    <div id="persona" className="pb-48">
      <UserHeader user={user} mutateUser={mutateUser} />

      <div className="bg-yellow-200">
        <div className="max-w-5xl mx-auto text-sm text-center py-2 px-5">
          Halaman ini dapat diakses hingga{` `}
          {batch.accessCloseDateTime}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5">
        <h2 className="text-2xl font-extrabold mt-10 mb-4">Data Persona</h2>

        <UserInfo user={user} />

        <h2 className="text-2xl font-extrabold mt-12 mb-4">Tes Mandiri</h2>

        <Timing batch={batch} onIdle={handleOnIdle} />

        <Assignments
          user={user}
          batch={batch}
          modules={modules}
          setSubmitting={setSubmitting}
        />

        <h2 className="text-2xl font-extrabold mt-10 mb-4">Temumuka</h2>

        <table className="w-full border-t font-medium">
          <tbody>
            <tr className="border-b">
              <td className="py-1">Tanggal:</td>
              <td className="py-1 px-2">{batch.facetime.date}</td>
            </tr>
            {batch.facetime.slots.map(s => (
              <tr key={s[0]} className="border-b">
                <td className="py-1">{s[1]}:</td>
                <td className="py-1 px-2">
                  Pukul {s[0]} WIB{` `}
                  {/* <span className="font-normal">sss</span> */}
                </td>
              </tr>
            ))}
            <tr className="border-b">
              <td className="py-1">Grup:</td>
              <td className="py-1 px-2">{batch.facetime.members.join(", ")}</td>
            </tr>
          </tbody>
        </table>



        {/* <pre className="">BATCH {JSON.stringify(batch, null, 2)}</pre> */}
        {/* <pre className="">PROGRESS {JSON.stringify(userProgress, null, 2)}</pre> */}
        {/* <pre className="">USER {JSON.stringify(user, null, 2)}</pre> */}
        {/* <pre className="">MODULES {JSON.stringify(modules, null, 2)}</pre> */}

        {submitting && <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-300 bg-opacity-50">
          <div className="flex h-full items-center justify-center">
            <div className="bg-white shadow pl-4 pr-8 py-1">Mempersiapkan test...</div>
          </div>
        </div>}
      </div>
    </div>
  )
}

export default Persona

const Timing = ({ batch, onIdle }) => {
  return (
    <table className="w-full border--t mb-6">
      <tr className="border--b">
        <td className="w-40 whitespace-nowrap py--1">Test dibuka:</td>
        <td className="py--1 pl-3 font--semibold">
          <span className="">{batch.testOpenDate}</span>{` `}
          Pukul{` `}
          <span className="">{batch.testOpenTime}</span>
        </td>
      </tr>
      <tr className="border--b">
        <td className="whitespace-nowrap py--1">Test ditutup:</td>
        <td className="py--1 pl-3 font--semibold">
          <span className="">{batch.testCloseDate}</span>{` `}
          Pukul{` `}
          <span className="">{batch.testCloseTime}</span>
        </td>
      </tr>
      <tr className="border--b">
        <td className="whitespace-nowrap py--1">Urutan pengerjaan:</td>
        <td className="py--1 pl-3">
          {batch.order ? "Urut" : 'Bebas'}
        </td>
      </tr>
      {batch.testStatus == BATCHTEST.WAITING && (
        <tr className="border--b">
          <td className="whitespace-nowrap py--1">Opening countdown:</td>
          <td className="py--1 pl-3">
            <Countdown batch={batch} onIdle={onIdle} />
          </td>
        </tr>
      )}
      {batch.testStatus == BATCHTEST.READY && (
        <tr className="border--b">
          <td className="whitespace-nowrap py--1">Closing countdown:</td>
          <td className="py--1 pl-3">
            <Countdown batch={batch} type={BATCHTEST.READY} onIdle={onIdle} />
          </td>
        </tr>
      )}
    </table>
  )
}

const Countdown = ({ batch, type = BATCHTEST.WAITING, onIdle }) => {
  function getTimeout() {
    if (type == BATCHTEST.WAITING && batch.testWaiting > 0 ) {
      return batch.testWaiting;
    }
    else if (type == BATCHTEST.READY && batch.testRemaining > 0 ) {
      return batch.testRemaining;
    }
    return 0
  }

  if (getTimeout() == 0 && type == BATCHTEST.WAITING) return <span className="text-green-500">READY</span>
  if (getTimeout() == 0 && type == BATCHTEST.READY) return <span className="text-red-500">EXPIRED</span>

  return (
    <span className="font-bold">
      <CompoundTimer
        initialTime={getTimeout()}
        direction="backward"
        lastUnit="h"
        formatValue={n => ('' + n).padStart(2,0)}
        checkpoints={[{
          time: 0,
          callback: () => onIdle()
        }]}
      >
        <CompoundTimer.Hours />:<CompoundTimer.Minutes />:<CompoundTimer.Seconds />
      </CompoundTimer>
    </span>
  )
}
