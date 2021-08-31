import { format, compareAsc, subDays, addDays } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { id as INA } from 'date-fns/locale'

import { connect } from "lib/database"
import { ACES_DB, ALLOWED_WAITING_TIME, COLLECTION, TOKEN } from "config/constants"

export default async function token(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { client } = await connect()
    const db = client.db(ACES_DB)
    const { token } = req.body
    console.log("Token", token)

    const rs = await db.collection(COLLECTION.Batches).findOne({ token: token })

    console.log("RS", rs)
    if (!rs) return res.json({ status: TOKEN.NOT_FOUND })

    const now = new Date()
    const openDate = new Date(rs.testOpen)
    const closeDate = new Date(rs.testClose)

    // Token can be used 1 day before and after batch dates,
    // starting 02 AM on Day-1 until 10 PM on Day+1
    const dates = [
      new Date(rs.testOpen),
      new Date(rs.testClose),
      new Date(rs.simDate)
    ]
    dates.sort(compareAsc)
    let openLogin = utcToZonedTime(dates[0], 'Asia/Jakarta')
    let closeLogin = utcToZonedTime(dates[2], 'Asia/Jakarta')
    openLogin = subDays(openLogin, 1)
    closeLogin = addDays(closeLogin, 1)
    openLogin.setHours(2)
    openLogin.setMinutes(0)
    closeLogin.setHours(22)
    closeLogin.setMinutes(0)

    console.log(openLogin)
    console.log(closeLogin)

    // Ready to login request
    // x (ALLOWED_WAITING_TIME) minutes before openDate
    // const readyDate = new Date(openDate.getTime() - ALLOWED_WAITING_TIME)

    let tokenStatus = TOKEN.OK
    // if (now.getTime() >= closeDate.getTime()) tokenStatus = TOKEN.EXPIRED
    // if (now.getTime() < readyDate.getTime()) tokenStatus = TOKEN.NOT_READY
    if (now.getTime() >= closeLogin.getTime()) tokenStatus = TOKEN.EXPIRED
    if (now.getTime() < openLogin.getTime()) tokenStatus = TOKEN.NOT_READY

    if (tokenStatus != TOKEN.OK) {
      return res.json({ status: tokenStatus })
    }

    return res.json({
      status: TOKEN.OK,
      batch: {
        _id: rs._id,
        pid: rs.pid,
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
}
