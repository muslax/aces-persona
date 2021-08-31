import LogoutButton from "./LogoutButton"

const UserHeader = ({ user, mutateUser }) => {
  return <>
    <div className="bg-white border--b border-yellow-400">
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
  </>
}

export default UserHeader