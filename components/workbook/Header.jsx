let index = 0
const Header = ({ user, module}) => {
  console.log(`Header ${index++}`)
  return <>
    <div className="bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="py-4 px-5">
          <p className="font-bold">{user.project} - {user.client}</p>
          <p className="font-bold">{user.client}</p>
          <p className="font-bold">{user.fullname}</p>
          <p className="font-bold">{module.title} - {module.maxTime / 60000} menit</p>
          <p className="">Sisa waktu</p>
        </div>
      </div>
    </div>
  </>
}

export default Header
