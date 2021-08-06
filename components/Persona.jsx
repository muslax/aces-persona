import { useEffect, useState } from "react"

import useUserProgress from "hooks/useUserProgress"
import useBatchInfo from "hooks/useBatchInfo"

import LogoutButton from "./LogoutButton"
import TestWarning from "./TestWarning"

const Persona = ({ modules, user, mutateUser }) => {
  const { data: batchInfo, isError: batchError, isLoading: batchLoading, mutate: mutateBatch } = useBatchInfo(user.bid, user.gid)
  const { data: progressData, isError, isLoading, mutate: mutateProgress } = useUserProgress()

  const [testIsReady, setTestIsReady] = useState(false)

  useEffect(() => {
    setTestIsReady(batchInfo?.waitingTime == 0)
  }, [batchInfo])

  if (isError || batchError) return <p>ERROR</p>
  if (isLoading || batchLoading) return <></>


  return (
    <div id="PersonaComponent">
      {/* Header */}
      <div className="bg-white border-b border-blue-200">
        <div className="max-w-5xl mx-auto py-4 px-5">
          <div className="flex">
            <div className="flex-grow">
              <p className="text--lg font-bold">{user.project}</p>
              <p className="font-bold">{user.client}</p>
            </div>
            <div className="">
              <LogoutButton
                label="Keluar"
                mutate={mutateUser}
                className="inline-flex border px-3 py-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="max-w-5xl mx-auto py-4 px-5">
        <div className="rounded- -border bg--white mb-8">
          <h2 className="text-3xl font-extrabold mt-10 mb-4">Data Persona</h2>
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td width="15%" className="py-2 pr-4 whitespace-nowrap">Nama Lengkap:</td>
                <td className="py-2 font-bold">{user.fullname}</td>
              </tr>
              <tr className="border-b">
                <td width="15%" className="py-2 pr-4 whitespace-nowrap">Jenis Kelamin:</td>
                <td className="py-2 font-bold">{user.gender}</td>
              </tr>
              <tr className="border-b">
                <td width="15%" className="py-2 pr-4 whitespace-nowrap">NIP / Nomor:</td>
                <td className="py-2 font-bold">{user.nip}</td>
              </tr>
              <tr className="border-b">
                <td width="15%" className="py-2 pr-4 whitespace-nowrap">Posisi / Jabatan:</td>
                <td className="py-2 font-bold">{user.position}</td>
              </tr>
              <tr className="border-b">
                <td width="15%" className="py-2 pr-4 whitespace-nowrap">Email:</td>
                <td className="py-2 font-bold">{user.email}</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-3xl font-extrabold mt-12 mb-4">Test Online</h2>
          {/* {batchInfo.waitingTime == 0 && (
            <p className="font-bold mb-2">Anda dapat mulai mengerjakan sekarang.</p>
          )} */}

          <TestWarning batchInfo={batchInfo} callback={setTestIsReady} />


          <p className="font-bold mb-2">Logout otomatis: {batchInfo.strCloseDate} Pukul {batchInfo.strCloseTime} WIB</p>
          <p className="mb-2">Tanggal Tes: {user.testOpen}</p>
          <p className="mb-2">Waktu Tes: {user.testOpen}</p>
          <p className="mb-2">Urutan Tes: {user.testOpen}</p>


          <h2 className="text-3xl font-extrabold mt-12 mb-4">Daftar Test Online</h2>

          {testIsReady && (
            <p className="text-lg text-green-500">Ready</p>
          )}

          {progressData.map(pd => (
            <p key={pd.type} className="mb-2">
            {modules[pd.mid].title} {modules[pd.mid].maxTime / 60000} menit{` `}
            /test/20210811/{pd.mid}
            </p>
          ))}

          <h2 className="text-3xl font-extrabold mt-12 mb-4">Jadwal Temumuka</h2>

          {user.sims.map(({ mid }) => (
            <p key={mid} className="mb-2">{modules[mid].title}</p>
          ))}

        </div>
        <pre className="">{JSON.stringify(user, null, 2)}</pre>
        <pre className="">PROGRESS {JSON.stringify(progressData, null, 2)}</pre>
        <pre className="">BATCH {JSON.stringify(batchInfo, null, 2)}</pre>
      </div>
    </div>
  )
}

export default Persona
