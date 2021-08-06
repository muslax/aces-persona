import { withIronSession } from "next-iron-session"
import { AUTH } from "config/client"

export default function withSession(handler) {
  return withIronSession(handler, {
    password: process.env.COOKIE_PASSWORD,
    cookieName: AUTH.CookieName,
    cookieOptions: {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production' ? true : false,
    },
  })
}
