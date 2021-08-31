import { utcToZonedTime } from "date-fns-tz"
import { compareAsc, addDays } from "date-fns"

import API from "config/api"
import { formatIDDate } from 'lib/utils'
import { ACES_DB, COLLECTION, EVIDENCE_DB, BATCHTEST } from "config/constants"
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

      // Return early when group or batch not found
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

      // Define (test) slot open and close
      // 1. Use batch.testOpen date
      let slotOpenDate = utcToZonedTime(new Date(batch.testOpen), 'Asia/Jakarta')
      let slotCloseDate = utcToZonedTime(new Date(batch.testOpen), 'Asia/Jakarta')
      // 2. Change hours and minutes props
      const hours = parseInt(testSlotStart.split('.')[0])
      const minutes = parseInt(testSlotStart.split('.')[1])
      slotOpenDate.setHours(hours)
      slotOpenDate.setMinutes(minutes)
      // Give 2 hours duration
      slotCloseDate.setHours(hours + 2)
      slotCloseDate.setMinutes(minutes)
      // 3. Use these 3 lines to experiment
      // slotOpenDate.setHours(16)
      // slotOpenDate.setMinutes(20)
      // slotCloseDate.setHours(18)

      let timing = batch.timing
      // const timing = "slot"

      // open and close define WHEN tests are available
      // Decide if they are using SLOT or DATE
      const open = timing == "slot" ? slotOpenDate : zonedOpenDate
      const close = timing == "slot" ? slotCloseDate : zonedCloseDate

      let waitingTime = open.getTime() - now.getTime() // 0
      // if (now.getTime() < open.getTime()) {
      //   waitingTime = open.getTime() - now.getTime()
      // }

      let testRemainingTime = close.getTime() - now.getTime()

      const dates = [
        new Date(batch.testOpen),
        new Date(batch.testClose),
        new Date(batch.simDate)
      ]
      dates.sort(compareAsc)
      let lastAccess = utcToZonedTime(dates[2], 'Asia/Jakarta')
      lastAccess.setHours(22)
      lastAccess.setMinutes(0)
      lastAccess = addDays(lastAccess, 1)

      const remaining = lastAccess.getTime() - now.getTime()

      let testStatus = BATCHTEST.READY
      if (waitingTime >= 0) testStatus = BATCHTEST.WAITING
      if (testRemainingTime <= 0) testStatus = BATCHTEST.EXPIRED

      const slots = [
        [batch.slot1, group.slot1],
        [batch.slot2, group.slot2],
        [batch.slot3, group.slot3],
        [batch.slot4, group.slot4],
      ]
      console.log("Slots", slots)
      console.log("Batch", batch)


      return res.json({
        batchOpenDate: batch.testOpen,
        batchCloseDate: batch.testClose,
        batchSimDate: batch.simDate,

        order: batch.order,
        timing: batch.timing,

        nowMs: now.getTime(),
        testOpenMs: open.getTime(),
        testCloseMs: close.getTime(),
        testWaiting: waitingTime,
        testRemaining: testRemainingTime,
        testStatus: testStatus,

        testOpenDay: formatIDDate(open, 'EEEE'),
        testCloseDay: formatIDDate(close, 'EEEE'),
        testOpenDate: formatIDDate(open, 'd MMMM yyyy'),
        testCloseDate: formatIDDate(close, 'd MMMM yyyy'),
        testOpenTime: formatIDDate(open, 'HH:mm'),
        testCloseTime: formatIDDate(close, 'HH:mm'),

        accessCloseMs: lastAccess.getTime(),
        accessRemaining: remaining,
        accessCloseDateTime: `${formatIDDate(lastAccess, 'EEEE, d MMMM yyyy')} Pukul ${formatIDDate(lastAccess, 'HH:mm')} WIB`,

        facetime: {
          group: group.name,
          members: persons,
          date: batch.simDate,
          slots: slots.filter(s => s[1].toLowerCase() != 'selftest'),
        },
      })
    })
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  } finally {
    await session.endSession()
  }
}

// Get progress of all user tests
export async function getAssignments(req, res) {
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

export async function getTestProgress(req, res) {
  try {
    const apiUser = req.session.get('user');
    const { type } = req.query;
    const { client } = await connect();
    const db = client.db(EVIDENCE_DB);
    const collectionName = type.toLowerCase();
    console.log(collectionName)
    const rs = await db.collection(collectionName).findOne(
      { personaId: apiUser._id },
      { projection: {
        personaId: 1,
        moduleId: 1,
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
    );

    return res.json(rs)
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export const QUERIES = {}
QUERIES[API.GET.BATCH_INFO] = getBatchInfo
QUERIES[API.GET.ASSIGNMENTS] = getAssignments
QUERIES[API.GET.USER_PROGRESS] = getUserProgress
QUERIES[API.GET.TEST_PROGRESS] = getTestProgress