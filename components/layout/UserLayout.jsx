export default function UserLayout({ children }) {
  return (
    <div id="user-layout" className="bg-gray-50 bg-gradient-to-t from-white">
      <div className="min-h-screen">
        {children}
      </div>
      {/* <footer className="bg-white py-8">
      </footer> */}
    </div>
  )
}
