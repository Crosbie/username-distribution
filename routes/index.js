var express = require('express');
var router = express.Router();
var config = require('../config');
const log = require('barelog')
const users = require('../lib/users')
const { default: PQueue } = require('p-queue')

const assigmentQ = new PQueue({
  concurrency: 1
})

var title = config.eventTitle;
var password = config.accounts.password;


/* GET home page. */
router.get('/', async (req, res) => {
  var username = req.session.username

  // Users are a resource that are locked/unlocked asynchronously in the cache
  // We need to queue requests to get users to avoid conflicts in assignment
  assigmentQ.add(async () => {
    if (!username) {
      log('the incoming connection has no user in the session, requesting new user assignment')
      let user = await users.getAndAssignUser(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
      log('found free user is', user)
      if (user) {
        username = user.username
      }
    }

    if (!username) {
      res.render('sorry', {
        message: 'All available accounts have been assigned to participants. Please contact the lab administrator if you believe this is an error.'
      })
    } else {
      req.session.username = username

      res.render('index', {
        username,
        password: password,
        title: title,
        modules: config.modules
      });
    }
  })
});

module.exports = router;
