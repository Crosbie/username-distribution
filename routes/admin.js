var express = require('express');
var router = express.Router();
const basicAuth = require('express-basic-auth')
const log = require('barelog')
const users = require('../lib/users')
const config = require('../config')
const sessions = require('../lib/session-store')
const maxBy = require('lodash.maxby')
const pMap = require('p-map')
const { promisify } = require('util')

// This route will require admin users to authenticate
router.use(basicAuth({
  challenge: true,
  users: {
    'admin': config.adminPassword
  }
}))

/* GET users listing. */
router.get('/', async (req, res) => {
  // Format user objects for easier HTML rendering
  const userList = await users.getUserList()
  const formattedUsers = await pMap(userList, (u, idx) => {
    // Need to create a clone of the user
    const user = { ...u }

    if (idx % 2 !== 0) {
      user.odd = true
    }

    return user
  })

  if (req.session.streamerMode === undefined) {
    // Enable streamer mode by default
    req.session.streamerMode = true
  }

  res.render('admin', {
    title: 'Admin Panel',
    accessToken: config.accounts.accessToken,
    users: formattedUsers,
    streamerMode: req.session.streamerMode
  })
});

/**
 * Deletes all user sessions and unassigns all users
 */
router.get('/unassign-all', async (req, res) => {
  log('uassigning all users and deleting all sessions')

  const clearSessions = promisify(sessions.clear).bind(sessions)

  async function unassignUsers () {
    const userList = await users.getUserList()

    return Promise.all(
      userList.map((u) => users.unassignUser(u.username))
    )
  }

  try {
    await Promise.all([
      clearSessions(),
      unassignUsers()
    ])

    log('successfully unassigned all users and deleted all sessions')
    res.redirect('/admin')
  } catch (e) {
    log('failed to unassign all users and delete all sessions', e)
    res.render('sorry', {
      message: 'Failed to clear all users and sessions. Check the application logs for more information.'
    })
  }
})

router.get('/accounts', async (req,res) => {
  const list = await users.getUserList()
  const lastAssigned = maxBy(list, (u) => {
    return new Date(u.assignedTs).getTime()
  })
  const locked = list.filter(u => u.assignedTs)

  return res.json({
    lastAssigned,
    totalAccounts: list.length,
    locked
  });
})

/**
 * Frees this user for reassignment.
 * Should probably be a POST, but eh...?
 */
router.get('/unassign/:username', async (req, res, next) => {
  const username = req.params.username

  log(`unassignment requested for username ${username}`)
  const getAllSessions = promisify(sessions.all).bind(sessions)
  const destroySession = promisify(sessions.destroy).bind(sessions)

  function findSessionInList (sessionList, username) {
    if (Array.isArray(sessionList)) {
      // For some reason Redis returns an array of sessions where ID is a property
      return sessionList.find(s => s.username === username).id
    } else {
      // ...and in-memory sessions is an object where key is session ID
      return Object.keys(sessionList).find((key) => {
        return sessionList[key].username === username
      })
    }
  }

  async function deleteSessionUsingUsername (username) {
    log(`deleting session for username ${username}`)
    const sessionList = await getAllSessions()
    log(`finding session associated with "${username}"`)
    const targetSession = findSessionInList(sessionList, username)
    log('session was found as having ID:', targetSession)
    await destroySession(targetSession)
  }

  try {
    await users.unassignUser(username)
    await deleteSessionUsingUsername(username)

    res.redirect('/admin')
    log(`successfully unassigned "${username}"`)
  } catch (e) {
    log(`failed to unassign "${username}"`, e)
    next(e)
  }
})

router.get('/toggle-streamer-mode', (req, res) => {
  const isEnabled = req.session.streamerMode

  // If streamer mode is enabled then disable, if disbaled then enable,
  // and if it's not yet set then set it to true
  req.session.streamerMode = isEnabled ? false : true

  res.redirect('/admin')
})

module.exports = router;
