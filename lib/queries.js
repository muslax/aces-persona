import { utcToZonedTime } from "date-fns-tz"

import API from "config/api"
import { formatIDDate } from 'lib/utils'
import { ACES_DB, COLLECTION, EVIDENCE_DB } from "config/constants"
import { connect } from "./database"

export async function getBatchInfo(req, res) {
  const apiUser = req.session.get('user')
  const { bid, gid } = req.query
  const { client } = await connect()
  const session = await client.startSession()
  try {
    await session.withTransaction(async () => {
      const db = client.db(ACES_DB)
      const batch = await db.collection(COLLECTION.Batches).findOne({ _id: bid })
      const group = await db.collection(COLLECTION.Groups).findOne({ _id: gid })

      // group members
      const persons = []
      const personsIds = group.persons
      const personae = await db.collection(COLLECTION.Personae).find(
        { group: gid, _id: { $in: personsIds }},
        { projection: { _id: 0, fullname: 1 }}
      ).toArray()

      personae.forEach(p => { persons.push(p.fullname) })

      if (!batch || !group) return res.json({})

      const now = new Date()
      // Use zoned time
      const zonedOpenDate = utcToZonedTime(new Date(batch.testOpen), 'Asia/Jakarta')
      const zonedCloseDate = utcToZonedTime(new Date(batch.testClose), 'Asia/Jakarta')

      let testSlotStart = null
      const groupSlots = {slot1: group.slot1, slot2: group.slot2, slot3: group.slot3, slot4: group.slot4}
      Object.keys(groupSlots).forEach(k => {
        if (groupSlots[k].toLowerCase() == 'selftest') {
          if (!testSlotStart) testSlotStart = batch[k]
        }
      })

      // let slotStartDate = zonedOpenDate
      let slotStartDate = utcToZonedTime(new Date(batch.testOpen), 'Asia/Jakarta')
      const hours = parseInt(testSlotStart.split('.')[0])
      const minutes = parseInt(testSlotStart.split('.')[1])
      slotStartDate.setHours(hours)
      // slotStartDate.setHours(17)
      slotStartDate.setMinutes(minutes)

      const nowMs = now.getTime()
      const zonedOpenMs = zonedOpenDate.getTime()
      const zonedCloseMs = zonedCloseDate.getTime()
      const testSlotMs = slotStartDate.getTime()

      const startMs = batch.timing == "slot" ? testSlotMs : zonedOpenMs
      const testIsReady = nowMs >= startMs && nowMs < zonedCloseMs

      let waitingTime = 0
      if (nowMs < startMs) waitingTime = startMs - nowMs

      const remaining = zonedCloseMs - nowMs


      return res.json({
        order: batch.order,
        timing: batch.timing,
        testIsReady: testIsReady,
        waitingTime: waitingTime,
        remaining: remaining,
        nowMs: nowMs,
        zonedOpenMs: zonedOpenMs,
        zonedCloseMs: zonedCloseMs,
        testSlotMs: testSlotMs,
        testOpenDate: batch.testOpen,
        testCloseDate: batch.testClose,
        // zonedOpenDate: zonedOpenDate,
        // zonedCloseDate: zonedCloseDate,
        strOpenDate: formatIDDate(zonedOpenDate, 'EEEE, d MMMM yyyy'),
        strOpenTime: formatIDDate(zonedOpenDate, 'HH:mm'),
        strSlotDate: formatIDDate(slotStartDate, 'EEEE, d MMMM yyyy'),
        strSlotTime: formatIDDate(slotStartDate, 'HH:mm'),
        strCloseDate: formatIDDate(zonedCloseDate, 'EEEE, d MMMM yyyy'),
        strCloseTime: formatIDDate(zonedCloseDate, 'HH:mm'),
        simDate: batch.simDate,
        group: {
          name: group.name,
          members: persons,
        },
        // batch,
        // group,
      })
    })
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  } finally {
    await session.endSession()
  }
}

// api/get?q=get-user-progress&tests=type_id-type_id-type_id-type_id
export async function getUserProgress(req, res) {
  const apiUser = req.session.get('user')
  const tests = apiUser.tests
  let testTypes = []
  tests.forEach(t => { testTypes.push(t.type.toLowerCase()) })

  const { client } = await connect()
  const session = await client.startSession()

  try {
    await session.withTransaction(async () => {
      let ret = []
      const db = client.db(EVIDENCE_DB)

      // Manually iterate
      for (let i=0; i<tests.length; i++) {
        const collectionName = tests[i].type.toLowerCase()
        const doc = await db.collection(collectionName).findOne(
          { personaId: apiUser._id },
          { projection: {
            // personaId: 1,
            // moduleId: 1,
            fullname: 1,
            initiated: 1,
            started: 1,
            finished: 1,
            touched: 1,
            maxTime: 1,
            netTime: 1,
            remains: 1,
            length: 1,
            done: 1,
            sequence: 1,
          }}
        )

        ret.push({
          type: tests[i].type,
          mid: tests[i].mid,
          progress: doc ? doc : null,
        })
      }

      return res.json(ret)
    })
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  } finally {
    await session.endSession()
  }
}

export const QUERIES = {}
QUERIES[API.GET.BATCH_INFO] = getBatchInfo
QUERIES[API.GET.USER_PROGRESS] = getUserProgress