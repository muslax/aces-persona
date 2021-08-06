import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { id as INA } from 'date-fns/locale'

import { connect } from "lib/database"
import { ACES_DB, ALLOWED_WAITING_TIME, COLLECTION, TOKEN } from "config/constants"


function formatId (date, formatStr = 'PP') {
  return format(date, formatStr, {
    locale: INA // or global.__localeId__
  })
}

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

    if (!rs) return res.json({ status: TOKEN.NOT_FOUND })

    const now = new Date()
    const openDate = new Date(rs.testOpen)
    const closeDate = new Date(rs.testClose)
    // Ready to login request
    // x (ALLOWED_WAITING_TIME) minutes before openDate
    const readyDate = new Date(openDate.getTime() - ALLOWED_WAITING_TIME)

    let tokenStatus = TOKEN.OK
    if (now.getTime() >= closeDate.getTime()) tokenStatus = TOKEN.EXPIRED
    if (now.getTime() < readyDate.getTime()) tokenStatus = TOKEN.NOT_READY

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

    // Testing
    // const OPEN = "Aug 04 2021 13:00:00 GMT+0700 (WIB)" //.getTime()
    // const CLOSE = "Aug 05 2021 21:00:00 GMT+0700 (WIB)" //.getTime()
    // const tokens = ["112233", "ababab"]

    // if (!tokens.includes(token)) return res.json({
    //   status: TOKEN.NOT_FOUND
    // })

    // // const now = new Date()
    // const open = new Date(OPEN)
    // const close = new Date(CLOSE)
    // const ready = new Date(open.getTime() - ALLOWED_WAITING_TIME)

    // // Always use zonedTime
    // const openBerlin = utcToZonedTime(open, 'Europe/Berlin')
    // const openWIB = utcToZonedTime(open, 'Asia/Jakarta')




    // if (tokenStatus == TOKEN.OK) {
    //   return res.json({
    //     status: TOKEN.OK,
    //     batch: {
    //       name: "MY BATCH"
    //     }
    //   })
    // } else {
    //   return res.json({
    //     status: tokenStatus,
    //     open: open,
    //     openWIB: openWIB,
    //     openWib: formatId(open, 'EEEE, d MMMM yyyy HH:mm:ss'),
    //     openBerlin: formatId(openBerlin, 'EEEE, d MMMM yyyy HH:mm:ss'),
    //     closeWib: formatId(close, 'EEEE, d MMMM yyyy HH:mm:ss'),
    //   })
    // }
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
}
