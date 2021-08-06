import Link from "next/link"
import { useRouter } from "next/router"

import { API_ROUTES, ROUTES } from "config/routes"
import fetchJson from "lib/fetchJson"

const LogoutButton = ({ label, className, mutate }) => {
  const router = useRouter()

  async function handleClick(e) {
    e.preventDefault()
    await mutate(fetchJson(API_ROUTES.Logout, { method: 'POST' }))
    router.push(ROUTES.Home)
  }
  return (
    <Link href={API_ROUTES.Logout}>
      <a className={className} onClick={handleClick}>
        {label ? label : 'Logout'}
      </a>
    </Link>
  )
}

export default LogoutButton
