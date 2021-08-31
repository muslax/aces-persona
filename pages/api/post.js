import withSession from "lib/session"
import { MUTATIONS } from "lib/mutations"

export default withSession(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const apiUser = req.session.get('user')

  if (!apiUser || apiUser.isLoggedIn === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { q } = req.query
  if (!q || !MUTATIONS[q]) {
    return res.status(400).json({ message: 'Bad Request' })
  }

  const fn = MUTATIONS[q]
  return fn(req, res)
})
