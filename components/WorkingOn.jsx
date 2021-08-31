import Link from 'next/link'

const WorkingOn = ({ user, mutateUser }) => {
  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-5">
        <div className="rounded border border-gray-300 bg-white text-center py-10 px-5">
          <p className="text-2xl text-blue-500 font-medium mb-5">
            Anda sedang dalam sesi tes mandiri.
          </p>
          <p>
            <Link href={`/test/${user.workingOn}`}>
              <a
                className="inline-block rounded shadow bg-blue-400 hover:bg-blue-500 text-lg text-white font-bold px-8 py-2"
              >Lanjutkan</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default WorkingOn