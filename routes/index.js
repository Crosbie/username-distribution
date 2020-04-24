var express = require('express');
var router = express.Router();
var config = require('../config');
const log = require('barelog')
const users = require('../lib/users')


var title = config.eventTitle;
var password = config.accounts.password;

/* GET home page. */
router.get('/', function (req, res, next) {
  var username = req.session.username

  if (!username) {
    log('the incoming connection has no user in the session, requesting new user assignment')
    let user = users.getAndAssignUser(req.headers['x-forwarded-for'] || req.connection.remoteAddress)

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
});

module.exports = router;
