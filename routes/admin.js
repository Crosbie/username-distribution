var express = require('express');
var router = express.Router();
const basicAuth = require('express-basic-auth')
const log = require('barelog')
const users = require('../lib/users')
const config = require('../config')
const maxBy = require('lodash.maxby')
const pMap = require('p-map')

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

  res.render('admin', {
    title: 'Admin Panel',
    users: formattedUsers
  })
});

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
 * Should probably be a POST, but who cares?
 */
router.get('/unassign/:username', async (req, res, next) => {
  try {
    await users.unassignUser(req.params.username)
    res.redirect('/admin')
    log(`successfully unassigned "${req.params.username}"`)
  } catch (e) {
    log(`failed to unassign "${req.params.username}"`)
    next(e)
  }
})

module.exports = router;
