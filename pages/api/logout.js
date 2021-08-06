import withSession from 'lib/session'

export default withSession(async (req, res) => {
  req.session.destroy()

  // https://github.com/vvo/next-iron-session/issues/274
  res.setHeader("cache-control", "no-store, max-age=0")
  return res.json({ isLoggedIn: false })
})