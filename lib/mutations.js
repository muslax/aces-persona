import { ObjectID } from "bson";
import API from "config/api";
import { ACES_DB, EVIDENCE_DB, COLLECTION, Workbook } from "config/constants";
import { connect } from "./database";
import { generateGPQSequence } from "./utils";

// INIT_TEST:          'init-test',
// START_TEST:         'start-test',
// FINISH_TEST:        'finish-test',
// FORCE_FINISH_TEST:  'force-finish-test',
// CONTINUE_TEST:      'continue-test',
// CANCEL_TEST:        'cancel-test',
// CLOSE_TEST:         'close-test',


export async function initTest(req, res) {
  const apiUser = req.session.get('user')
  const { id, type } = req.body

  // Check user's current assignment
  if (apiUser.workingOn && apiUser.workingOn != id) {
    console.log("User is working on other test ", id)
    return res.status(401).json({ message: 'Unauthorized access' })
  }
  console.log("workingOn", apiUser.workingOn)
  console.log("id", id)

  const { client } = await connect()
  const session = client.startSession()
  const now = new Date()

  try {
    await session.withTransaction(async() => {
      // Check if evidence exists, and if not create
      const dba = client.db(ACES_DB)
      const dbe = client.db(EVIDENCE_DB)
      const collectionName = type.toLowerCase()
      const found = await dbe.collection(collectionName).findOne({
        personaId: apiUser._id,
        moduleId: id,
      })

      // If already created, just touch
      if (found) {
        await dbe.collection(collectionName).findOneAndUpdate(
          { personaId: apiUser._id, moduleId: id },
          { $set: {
            touched: now.getTime()
          }}
        )
      }
      // Else, create and initiate
      else {
        const module = await dba.collection(COLLECTION.Modules).findOne({ _id: id })
        const newDoc = {
          _id: ObjectID().toString(),
          personaId: apiUser._id,
          licenseId: apiUser.lid,
          projectId: apiUser.pid,
          batchId: apiUser.bid,
          moduleId: id,
          fullname: apiUser.fullname,
          initiated: now.getTime(),
          started: false,
          finished: false,
          touched: false,
          maxTime: module.maxTime,
          netTime: 0,
          remains: module.maxTime,
          length: module.length,
          done: 0,
          sequence: null,
          items: [],
        };

        // Generate random sequence
        if (type == Workbook.GPQ) newDoc.sequence = generateGPQSequence(module.length)

        await dbe.collection(collectionName).insertOne(newDoc)
      }

      // Mark user's workingOn
      await dba.collection(COLLECTION.Personae).findOneAndUpdate(
        { _id: apiUser._id },
        { $set: {
          workingOn: id,
          updated: now,
        }}
      )

      apiUser.workingOn = id
      req.session.set("user", apiUser)
      await req.session.save()

      return res.json({ message: "OK" })
    })
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  } finally {
    await session.endSession()
  }
}

// Start test: mark started and touched with new time
export async function startTest(req, res) {
  try {
    const { type, id } = req.body;
    const { client } = await connect();
    const dbe = client.db(EVIDENCE_DB);
    const collection = type.toLowerCase();
    console.log(collection, id);
    const now = new Date();
    const rs = await dbe.collection(collection).findOneAndUpdate(
      { _id: id },
      { $set: {
        started: now.getTime(),
        touched: now.getTime(),
      }},
      {
        projection: { touched: 1, done: 1 },
        returnDocument: 'after',
      }
    )

    return res.json(rs)
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

// Continue test (eg after network error):
// mark touched with new time
export async function continueTest(req, res) {
  try {
    const { type, id } = req.body;
    const { client } = await connect();
    const dbe = client.db(EVIDENCE_DB);
    const collection = type.toLowerCase();
    console.log(collection, id);
    const now = new Date();
    const rs = await dbe.collection(collection).findOneAndUpdate(
      { _id: id },
      { $set: {
        touched: now.getTime(),
      }},
      {
        projection: { touched: 1, done: 1 },
        returnDocument: 'after',
      }
    )

    return res.json(rs)
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

// Forced finish: mark finished with new signed time
export async function forceFinishTest(req, res) {
  const apiUser = req.session.get('user')
  const { type, id } = req.body
  const { client } = await connect()
  const session = client.startSession()
  const now = new Date();

  try {
    await session.withTransaction(async() => {
      const dbe = client.db(EVIDENCE_DB)
      const collection = type.toLowerCase()
      await dbe.collection(collection).findOneAndUpdate(
        { _id: id },
        { $set: {
          finished: -now.getTime(),
          touched: now.getTime(),
          remains: 0,
        }}
      )

      // const dba = client.db(ACES_DB)
      // await dba.collection(COLLECTION.Personae).findOneAndUpdate(
      //   { _id: apiUser._id },
      //   { $set: {
      //     workingOn: null,
      //     updated: now,
      //   }}
      // )

      // apiUser.workingOn = null
      // req.session.set("user", apiUser)
      // await req.session.save()

      return res.json({ message: "OK" })
    })
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  } finally {
    await session.endSession()
  }
}

// Touch evidence, set workingOn to null, update session
export async function closeTest(req, res) {
  const apiUser = req.session.get('user')
  const { type, id } = req.body
  const { client } = await connect()
  const session = client.startSession()
  const now = new Date();

  try {
    await session.withTransaction(async() => {
      const dbe = client.db(EVIDENCE_DB)
      const collection = type.toLowerCase()
      await dbe.collection(collection).findOneAndUpdate(
        { _id: id },
        { $set: {
          touched: now.getTime(),
        }}
      )

      const dba = client.db(ACES_DB)
      await dba.collection(COLLECTION.Personae).findOneAndUpdate(
        { _id: apiUser._id },
        { $set: {
          workingOn: null,
          updated: now,
        }}
      )

      apiUser.workingOn = null
      req.session.set("user", apiUser)
      await req.session.save()

      return res.json({ message: "OK" })
    })
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  } finally {
    await session.endSession()
  }
}

export async function saveTestItem(req, res) {
  try {
    const apiUser = req.session.get('user')
    const {
      id,
      type,
      length,
      seq,
      bookSeq,
      // TODO: content is unique per type
      content,
      lastTouched,
    } = req.body
    const now = new Date()
    const finished = seq == length ? now.getTime() : false
    const elapsed = now.getTime() - lastTouched
    console.log("elapsed:", elapsed)
    // itemTobeSaved depends on type
    // TODO
    const itemTobeSaved = {
      seq: seq,
      bookSeq: bookSeq,
      content: 'User\'s choice',
      saved: now.getTime(),
      elapsed: elapsed,
    }
    const { client } = await connect()
    const dbe = client.db(EVIDENCE_DB)
    const collection = type.toLowerCase()
    const rs = await dbe.collection(collection).findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          done: 1,
          netTime: elapsed,
          remains: -elapsed,
        },
        $push: { items: itemTobeSaved },
        $set: {
          touched: now.getTime(),
          finished: finished,
        },
      },
      {
        projection: {
          // touched: 1,
          // done: 1,
          items: 0,
        },
        returnDocument: 'after' // version 4+
      }
    )

    console.log(rs)

    return res.json(rs)
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

/*
{
  "_id": "6114a27cf31906319a789d6f",
  "personaId": "6103644fa994fbdd5a24f4f4",
  "moduleId": "608eb14da51b23cbdf04d11e",
  "fullname": "Emily Asiri Martine",
  "initiated": 1628742268197,
  "started": 1628936611296,
  "finished": false,
  "touched": 1628936987873,
  "maxTime": 300000,
  "netTime": 40822,
  "remains": 279513,
  "length": 10,
  "done": 6,
  "sequence": null
}
value: {
    _id: '6114a27cf31906319a789d6f',
    personaId: '6103644fa994fbdd5a24f4f4',
    licenseId: '60f20b6425ac6066369018a8',
    projectId: '6103614aa994fbdd5a24f4f2',
    batchId: '6103614aa994fbdd5a24f4f3',
    moduleId: '608eb14da51b23cbdf04d11e',
    fullname: 'Emily Asiri Martine',
    initiated: 1628742268197,
    started: 1628936611296,
    finished: false,
    touched: 1628936662495,
    maxTime: 300000,
    netTime: 28973,
    remains: 291362,
    length: 10,
    done: 4,
    sequence: null,
    items: []
  },
*/



// Finish test: mark finished and touched with new time
// and set user.workingOn with null
export async function __finishTest(req, res) {
  const apiUser = req.session.get('user')
  const { type, id } = req.body
  const { client } = await connect()
  const session = client.startSession()
  const now = new Date();

  try {
    await session.withTransaction(async() => {
      const dbe = client.db(EVIDENCE_DB)
      const collection = type.toLowerCase()
      await dbe.collection(collection).findOneAndUpdate(
        { _id: id },
        { $set: {
          finished: now.getTime(),
          touched: now.getTime(),
        }}
      )

      const dba = client.db(ACES_DB)
      await dba.collection(COLLECTION.Personae).findOneAndUpdate(
        { _id: apiUser._id },
        { $set: {
          workingOn: null,
          updated: now,
        }}
      )

      apiUser.workingOn = null
      req.session.set("user", apiUser)
      await req.session.save()

      return res.json({ message: "OK" })
    })
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  } finally {
    await session.endSession()
  }
}


export async function __closeTest(req, res) {
  const apiUser = req.session.get('user')
  const { id, type } = req.body
  const { client } = await connect()
  const session = client.startSession()
  const now = new Date();

  try {
    await session.withTransaction(async() => {
      const dbe = client.db(EVIDENCE_DB)
      const collectionName = type.toLowerCase()
      await dbe.collection(collectionName).findOneAndUpdate(
        { personaId: apiUser._id },
        { $set: {
          finished: now.getTime(),
          touched: now.getTime(),
        }}
      )

      const dba = client.db(ACES_DB)
      await dba.collection(COLLECTION.Personae).findOneAndUpdate(
        { _id: apiUser._id },
        { $set: {
          workingOn: null,
          updated: now,
        }}
      )

      apiUser.workingOn = null
      req.session.set("user", apiUser)
      await req.session.save()

      return res.json({ message: "OK" })
    })
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  } finally {
    await session.endSession()
  }
}

export const MUTATIONS = {}
MUTATIONS[API.POST.INIT_TEST] = initTest
MUTATIONS[API.POST.START_TEST] = startTest
MUTATIONS[API.POST.FORCE_FINISH_TEST] = forceFinishTest
MUTATIONS[API.POST.CONTINUE_TEST] = continueTest
MUTATIONS[API.POST.CLOSE_TEST] = closeTest
MUTATIONS[API.POST.SAVE_TEST_ITEM] = saveTestItem

// MUTATIONS[API.POST.CANCEL_TEST] = cancelTest
// MUTATIONS[API.POST.FINISH_TEST] = finishTest