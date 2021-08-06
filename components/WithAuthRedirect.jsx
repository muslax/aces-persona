import useUser from "hooks/useUser"

const handleAuthRedirect = (user, {
  redirectAuthenticatedTo,
  redirectUnAuthenticatedTo,
}) => {
  if (typeof window === 'undefined') return

  if (!user || user.isLoggedIn === false) {
    if (redirectUnAuthenticatedTo !== undefined) {
      const url = new URL(redirectUnAuthenticatedTo, window.location.href)
      window.location.replace(url.toString())
    }
  } else {
    if (redirectAuthenticatedTo !== undefined) {
      window.location.replace(redirectAuthenticatedTo)
    }
  }
}

export default function WithAuthRedirect({ children, ...props }) {
  const { user, isLoading } = useUser();

  if (isLoading) return <></>;

  handleAuthRedirect(user, props);

  return <>
    {children}
  </>;
}