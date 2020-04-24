var express = require('express');
var router = express.Router();
const basicAuth = require('express-basic-auth')
const log = require('barelog')
const users = require('../lib/users')
const config = require('../config')
const maxBy = require('lodash.maxby')

// This route will require admin users to authenticate
router.use(basicAuth({
  challenge: true,
  users: {
    'admin': config.adminPassword
  }
}))

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin', {
    title: 'Admin Panel',
    // Format user objects for easier HTML rendering
    users: users.getUserList().map((u, idx) => {
      // Need to create a clone of the user
      const user = { ...u }

      if (idx % 2 !== 0) {
        user.odd = true
      }

      if (user.assignedTs) {
        user.assignedTs = u.assignedTs.toJSON()
      }

      return u
    })
  })
});

router.get('/accounts',function(req,res){
  const list = users.getUserList()
  const lastAssigned = maxBy(list, (u) => u.assignedTs).username
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
router.get('/unassign/:username', (req, res, next) => {
  try {
    users.unassignUser(req.params.username)
    res.redirect('/admin')
    log(`successfully unassigned "${req.params.username}"`)
  } catch (e) {
    log(`failed to unassign "${req.params.username}"`)
    next(e)
  }
})

module.exports = router;
