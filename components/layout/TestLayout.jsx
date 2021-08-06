import useUser from "hooks/useUser";
import Link from "next/link";

export function TestLayout({ children }) {
  const { user, isLoading, mutateUser } = useUser();

  if (isLoading) return <>...</>;

  const handleLogout = async (e) => {
    e.preventDefault()
    await mutateUser(fetchJson(API_ROUTES.Logout, { method: 'POST' }))
    router.push(ROUTES.Home)
  }

  return (
    <div className="border-t-8 border-gray-800">
      <div className="container min-h-screen max-w-3xl mx-auto px-4 pb-24">
        <>{children}</>
      </div>
      {/* <div id="footer" className="bg-gray-100">
        <div className="container max-w-4xl mx-auto px-5 pt-4 pb-7">
          <br/><br/><br/>
        </div>
      </div> */}
    </div>
  );
}
