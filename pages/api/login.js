import bcrypt from 'bcryptjs'

import withSession from "lib/session";
import { connect } from "lib/database";
import { ACES_DB, COLLECTION } from "config/constants";

// 61077cce53f2411665476db4

export default withSession(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password, bid, pid } = req.body
  const { client } = await connect()
  const session = await client.startSession()

  try {
    await session.withTransaction(async () => {
      const db = client.db(ACES_DB)
      const person = await db.collection(COLLECTION.Personae).findOne({
        username: username.toLowerCase(),
        bid: bid,
      })

      if (!person) return res.status(404).json({
        message: "(1) Username atau password salah."
      })

      const verified = bcrypt.compareSync(password, person.hashed_password)
      if (!verified) return res.status(404).json({
        message: "(2) Username atau password salah."
      })

      const project = await db.collection('SimpleProjectInfo').findOne({ _id: pid })
      const batch = await db.collection(COLLECTION.Batches).findOne({ _id: bid })
      const group = await db.collection(COLLECTION.Groups).findOne({ _id: person.group })

      const user = {
        isLoggedIn: true,
        _id: person._id,
        pid: person.pid,
        bid: person.bid,
        gid: person.group,
        //
        username: person.username,
        fullname: person.fullname,
        gender: person.gender,
        email: person.email,
        nip: person.nip,
        position: person.position,
        currentLevel: person.currentLevel,
        targetLevel: person.targetLevel,
        //
        tenant: project.tenant,
        client: project.client,
        project: project.title,
        //
        tests: batch.tests,
        // testOpen: batch.testOpen,
        // testClose: batch.testClose,
        // testOrder: batch.order,
        // testTiming: batch.timing,
        //
        sims: batch.sims,
        // simDate: batch.simDate,
        //
        // slot1: { type: group.slot1, time: batch.slot1 },
        // slot2: { type: group.slot2, time: batch.slot2 },
        // slot3: { type: group.slot3, time: batch.slot3 },
        // slot4: { type: group.slot4, time: batch.slot4 },
        //
        asd: group.asd,
        asw: group.asw,
        //
        groupName: group.name,
        // groupMembers: group.persons,
      }

      req.session.set("user", user)
      // req.session.set("project", project)
      // req.session.set("batch", batch)
      await req.session.save()
      return res.json(user)
    })
  } catch (error) {
    res.status(404);
    res.json({ message: "[3] Username/password salah." });
  } finally {
    await session.endSession()
  }
})